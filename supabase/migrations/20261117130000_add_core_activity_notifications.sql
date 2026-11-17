-- Zack: durable notifications for orders, messages, subscription gifts and payments
CREATE OR REPLACE FUNCTION public.zack_notify_order_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public' AS $$
DECLARE v_status_label text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT NEW.customer_id,NEW.business_id,'order_status','Commande enregistrée',
      'Votre commande '||NEW.order_number||' a bien été enregistrée sur Zack.',
      'order',NEW.id,'order-created-customer:'||NEW.id::text
    WHERE COALESCE((SELECT np.account_activity AND np.in_app FROM public.notification_preferences np WHERE np.user_id=NEW.customer_id),true)
    ON CONFLICT (dedupe_key) DO NOTHING;

    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT bm.user_id,NEW.business_id,'order_new','Nouvelle commande',
      'Votre entreprise a reçu la commande '||NEW.order_number||'.',
      'order',NEW.id,'order-created-business:'||NEW.id::text||':'||bm.user_id::text
    FROM public.business_members bm
    LEFT JOIN public.notification_preferences np ON np.user_id=bm.user_id
    WHERE bm.business_id=NEW.business_id AND bm.role IN ('owner','admin','manager')
      AND COALESCE(np.account_activity,true) AND COALESCE(np.in_app,true)
    ON CONFLICT (dedupe_key) DO NOTHING;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_status_label := CASE NEW.status
      WHEN 'pending' THEN 'en attente' WHEN 'accepted' THEN 'acceptée'
      WHEN 'preparing' THEN 'en préparation' WHEN 'ready' THEN 'prête'
      WHEN 'out_for_delivery' THEN 'en cours de livraison'
      WHEN 'delivered' THEN 'livrée' WHEN 'completed' THEN 'terminée'
      WHEN 'cancelled' THEN 'annulée' ELSE NEW.status END;
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT NEW.customer_id,NEW.business_id,'order_status','Mise à jour de votre commande',
      'Le statut de la commande '||NEW.order_number||' est maintenant : '||v_status_label||'.',
      'order',NEW.id,'order-status-customer:'||NEW.id::text||':'||NEW.status
    WHERE COALESCE((SELECT np.account_activity AND np.in_app FROM public.notification_preferences np WHERE np.user_id=NEW.customer_id),true)
    ON CONFLICT (dedupe_key) DO NOTHING;

    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT bm.user_id,NEW.business_id,'order_status','Statut de commande modifié',
      'La commande '||NEW.order_number||' est maintenant : '||v_status_label||'.',
      'order',NEW.id,'order-status-business:'||NEW.id::text||':'||NEW.status||':'||bm.user_id::text
    FROM public.business_members bm
    LEFT JOIN public.notification_preferences np ON np.user_id=bm.user_id
    WHERE bm.business_id=NEW.business_id AND bm.role IN ('owner','admin','manager')
      AND bm.user_id<>NEW.customer_id
      AND COALESCE(np.account_activity,true) AND COALESCE(np.in_app,true)
    ON CONFLICT (dedupe_key) DO NOTHING;
  END IF;

  IF NEW.courier_id IS NOT NULL AND NEW.courier_id IS DISTINCT FROM OLD.courier_id THEN
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT c.user_id,NEW.business_id,'mission_assigned','Nouvelle mission de livraison',
      'La commande '||NEW.order_number||' vous a été affectée pour livraison.',
      'order',NEW.id,'order-courier-assigned:'||NEW.id::text||':'||c.user_id::text
    FROM public.couriers c
    LEFT JOIN public.notification_preferences np ON np.user_id=c.user_id
    WHERE c.id=NEW.courier_id AND c.user_id IS NOT NULL
      AND COALESCE(np.account_activity,true) AND COALESCE(np.in_app,true)
    ON CONFLICT (dedupe_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zack_order_activity_notification ON public.orders;
CREATE TRIGGER zack_order_activity_notification
AFTER INSERT OR UPDATE OF status, courier_id ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.zack_notify_order_activity();

CREATE OR REPLACE FUNCTION public.zack_notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public' AS $$
DECLARE v_customer_id uuid; v_business_id uuid;
BEGIN
  SELECT c.customer_id,c.business_id INTO v_customer_id,v_business_id
  FROM public.conversations c WHERE c.id=NEW.conversation_id;
  IF v_customer_id IS NULL OR v_business_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.sender_id = v_customer_id THEN
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT bm.user_id,v_business_id,'chat_message','Nouveau message',
      'Un client vous a envoyé un message : '||left(NEW.body,180),
      'conversation',NEW.conversation_id,'message-business:'||NEW.id::text||':'||bm.user_id::text
    FROM public.business_members bm
    LEFT JOIN public.notification_preferences np ON np.user_id=bm.user_id
    WHERE bm.business_id=v_business_id AND bm.role IN ('owner','admin','manager')
      AND bm.user_id<>NEW.sender_id
      AND COALESCE(np.account_activity,true) AND COALESCE(np.in_app,true)
    ON CONFLICT (dedupe_key) DO NOTHING;
  ELSE
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT v_customer_id,v_business_id,'chat_message','Nouveau message',
      'Votre entreprise vous a envoyé un message : '||left(NEW.body,180),
      'conversation',NEW.conversation_id,'message-customer:'||NEW.id::text
    WHERE COALESCE((SELECT np.account_activity AND np.in_app FROM public.notification_preferences np WHERE np.user_id=v_customer_id),true)
    ON CONFLICT (dedupe_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zack_new_message_notification ON public.messages;
CREATE TRIGGER zack_new_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.zack_notify_new_message();

CREATE OR REPLACE FUNCTION public.zack_notify_subscription_gift()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public' AS $$
DECLARE v_plan_name text;
BEGIN
  SELECT name INTO v_plan_name FROM public.subscription_plans WHERE id=NEW.plan_id;
  INSERT INTO public.notifications
    (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
  SELECT bm.user_id,NEW.business_id,'payment_status','Abonnement offert',
    'L’administration Zack vous a offert le forfait '||COALESCE(v_plan_name,'premium')||' pour '||NEW.days||' jours.',
    'subscription',NEW.subscription_id,'subscription-gift:'||NEW.id::text||':'||bm.user_id::text
  FROM public.business_members bm
  LEFT JOIN public.notification_preferences np ON np.user_id=bm.user_id
  WHERE bm.business_id=NEW.business_id AND bm.role IN ('owner','admin')
    AND COALESCE(np.account_activity,true) AND COALESCE(np.in_app,true)
  ON CONFLICT (dedupe_key) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zack_subscription_gift_notification ON public.subscription_grants;
CREATE TRIGGER zack_subscription_gift_notification
AFTER INSERT ON public.subscription_grants
FOR EACH ROW EXECUTE FUNCTION public.zack_notify_subscription_gift();

CREATE OR REPLACE FUNCTION public.zack_notify_payment_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public' AS $$
DECLARE v_label text;
BEGIN
  IF TG_OP='INSERT' AND NEW.status='needs_review' THEN
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT ar.user_id,NEW.business_id,'system','Paiement à vérifier',
      'Un paiement de '||NEW.amount||' '||NEW.currency||' attend une vérification.',
      'payment',NEW.id,'payment-review-admin:'||NEW.id::text||':'||ar.user_id::text
    FROM public.admin_roles ar
    ON CONFLICT (dedupe_key) DO NOTHING;
    RETURN NEW;
  END IF;
  IF TG_OP='UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    v_label := CASE NEW.status WHEN 'succeeded' THEN 'confirmé'
      WHEN 'failed' THEN 'refusé' WHEN 'needs_review' THEN 'en cours de vérification'
      ELSE NEW.status END;
    INSERT INTO public.notifications
      (user_id,business_id,notification_type,title,message,entity_type,entity_id,dedupe_key)
    SELECT recipients.user_id,NEW.business_id,'payment_status','Mise à jour du paiement',
      'Le paiement de '||NEW.amount||' '||NEW.currency||' est maintenant '||v_label||'.',
      'payment',NEW.id,'payment-status:'||NEW.id::text||':'||NEW.status||':'||recipients.user_id::text
    FROM (
      SELECT NEW.created_by AS user_id WHERE NEW.created_by IS NOT NULL
      UNION
      SELECT bm.user_id FROM public.business_members bm
      WHERE bm.business_id=NEW.business_id AND bm.role IN ('owner','admin')
    ) recipients
    LEFT JOIN public.notification_preferences np ON np.user_id=recipients.user_id
    WHERE COALESCE(np.account_activity,true) AND COALESCE(np.in_app,true)
    ON CONFLICT (dedupe_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS zack_payment_activity_notification ON public.payments;
CREATE TRIGGER zack_payment_activity_notification
AFTER INSERT OR UPDATE OF status ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.zack_notify_payment_activity();
