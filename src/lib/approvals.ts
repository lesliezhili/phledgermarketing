// Approvals — the "harness" that decides who must approve each action the
// agent wants to take, per client.
//
// Modes (chosen per client):
//   zhi_li            Zhi Li approves content; routine low-risk work runs itself
//   zhi_li_and_client Zhi Li approves, then the client approves content
//   auto_simple       full automation for simple, low-risk actions (simple ads,
//                     plain thank-you replies, confirmations); the rest as zhi_li
//
// Hard rules apply in EVERY mode and cannot be switched off:
//   - critical reviews and allergy orders always go to a person and the owner
//   - prices, discounts, offers, refunds and compensation are the owner's decision
//   - complaints are answered by a person (AI only acknowledges instantly)
//   - case studies, press releases and event spending need the client's sign-off
//   - spending more than the client's ad plan needs the client's approval
//   - RedNote has no public API: a person sends
//   - anything not listed is not allowed automatically

export type ApprovalMode = 'zhi_li' | 'zhi_li_and_client' | 'auto_simple'

export type ActionType =
  | 'ad_budget_today' // set today's budget within the monthly plan
  | 'ad_pause' // pause an ad or campaign (stops spend)
  | 'ad_budget_increase' // spend above the agreed plan
  | 'ad_new_creative' // a new ad text/image
  | 'review_reply_positive'
  | 'review_reply_negative'
  | 'review_reply_critical'
  | 'enquiry_reply' // speed-to-lead first reply
  | 'order_confirmation' // a validated order with no allergy note
  | 'order_allergy'
  | 'post_google'
  | 'post_social' // Instagram / Facebook
  | 'post_rednote'
  | 'loyalty_message' // birthday, win-back, seasonal (consented customers only)
  | 'offer_discount' // any discount or free item
  | 'price_change'
  | 'cs_instant_reply' // customer service: factual answer from the client's approved facts, or a holding reply that promises nothing
  | 'cs_support_reply' // how-to or fault help that needs a person's words
  | 'cs_complaint_reply' // the reply to an unhappy customer
  | 'cs_refund' // refund, replacement, repair, credit or compensation
  | 'cs_critical' // food safety, allergy, injury, legal or threats
  | 'content_longform' // blog, whitepaper, guide, webinar deck, landing page
  | 'case_study_publish' // names a customer or their results
  | 'press_release' // statement to media
  | 'event_spend' // venue, catering, sponsorship or paid promotion for an event

export type Route = 'auto' | 'zhi_li' | 'zhi_li_then_client' | 'person_sends' | 'escalate_owner'

export interface ApprovalPolicy {
  mode: ApprovalMode
  clientApproves?: ActionType[] // extra actions the client wants to see first
  maxDailyAdBudget?: number // auto_simple: never auto-set a day above this
}

export interface ActionRequest {
  type: ActionType
  amount?: number // e.g. today's ad budget
  planDailyMax?: number // the plan's daily maximum (from daily-ads)
}

export interface Decision {
  route: Route
  reason: string
}

// Routine, transactional and time-critical: these run automatically in every
// mode, because speed is the value (a reply in 60 seconds, a confirmed order).
const ALWAYS_AUTO: ActionType[] = ['enquiry_reply', 'order_confirmation', 'ad_budget_today', 'ad_pause', 'cs_instant_reply']

// Simple and low-risk: automatic only in auto_simple mode.
const SIMPLE: ActionType[] = ['review_reply_positive', 'post_google', 'loyalty_message']

// Content the client may want to see in zhi_li_and_client mode.
const CONTENT: ActionType[] = ['review_reply_positive', 'review_reply_negative', 'post_google', 'post_social', 'post_rednote', 'loyalty_message', 'ad_new_creative', 'content_longform']

export function decide(action: ActionRequest, policy: ApprovalPolicy): Decision {
  const t = action.type

  // --- hard rules, every mode ---
  if (t === 'review_reply_critical' || t === 'order_allergy' || t === 'cs_critical') {
    return { route: 'escalate_owner', reason: 'Safety-critical: a person handles it and the owner is told now' }
  }
  if (t === 'case_study_publish') {
    return { route: 'zhi_li_then_client', reason: 'A case study names the customer: their written permission and the client\'s sign-off are needed' }
  }
  if (t === 'press_release' || t === 'event_spend') {
    return { route: 'zhi_li_then_client', reason: 'Public statements and event spending are the client\'s decision' }
  }
  if (t === 'price_change' || t === 'offer_discount' || t === 'cs_refund') {
    return { route: 'zhi_li_then_client', reason: 'Prices and offers are the owner\'s decision' }
  }
  if (t === 'ad_budget_increase') {
    return { route: 'zhi_li_then_client', reason: 'Spending above the ad plan needs the client\'s OK' }
  }
  if (t === 'ad_budget_today' && action.planDailyMax !== undefined && (action.amount ?? 0) > action.planDailyMax) {
    return { route: 'zhi_li_then_client', reason: 'Today\'s budget is above the plan\'s daily maximum' }
  }
  if (t === 'ad_budget_today' && policy.maxDailyAdBudget !== undefined && (action.amount ?? 0) > policy.maxDailyAdBudget) {
    return { route: 'zhi_li', reason: 'Above the client\'s automatic daily limit' }
  }
  if (t === 'post_rednote') {
    return { route: 'person_sends', reason: 'RedNote has no public API: AI drafts, a person posts' }
  }

  // --- the client asked to see this type first ---
  if (policy.clientApproves?.includes(t)) {
    return { route: 'zhi_li_then_client', reason: 'The client asked to approve this type of action' }
  }

  if (ALWAYS_AUTO.includes(t)) return { route: 'auto', reason: 'Routine and time-critical' }

  if (policy.mode === 'auto_simple' && SIMPLE.includes(t)) {
    return { route: 'auto', reason: 'Simple and low-risk in full-automation mode' }
  }
  if (policy.mode === 'zhi_li_and_client' && CONTENT.includes(t)) {
    return { route: 'zhi_li_then_client', reason: 'Client approves content in this mode' }
  }
  return { route: 'zhi_li', reason: 'Zhi Li approves before it goes out' }
}

export interface AuditEntry {
  at: string // ISO time
  client: string
  action: ActionType
  route: Route
  approvedBy: string[] // e.g. ['auto'] or ['Zhi Li', 'K']
  detail?: string
}

/** Every action is logged, so the client can see who approved what and when. */
export function auditEntry(client: string, action: ActionRequest, decision: Decision, approvedBy: string[], at: string, detail?: string): AuditEntry {
  if (decision.route !== 'auto' && approvedBy.length === 0) {
    throw new Error(`${action.type} needs approval (${decision.route}) before it can be logged as done`)
  }
  if (decision.route === 'zhi_li_then_client' && approvedBy.length < 2) {
    throw new Error(`${action.type} needs both Zhi Li and the client`)
  }
  return { at, client, action: action.type, route: decision.route, approvedBy: decision.route === 'auto' ? ['auto'] : approvedBy, detail }
}
