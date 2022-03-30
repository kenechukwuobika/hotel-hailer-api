
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
exports.PAYSTACK_TRANSACTION_URL = PAYSTACK_BASE_URL+'/transaction';

//payment plans
exports.FULL = 'full'
exports.WEEKLY = 'weekly'
exports.BI_WEEKLY = 'bi-weekly'
exports.MONTHLY = 'monthly'

//booking status
exports.AWAITING_PAYMENT  = 'awaiting_payment'
exports.CANCELLED  = 'cancelled'
exports.FAILED  = 'failed'
exports.PAYMENT_IN_PROGRESS  = 'payment_in_progress'
exports.PAYMENT_ON_HOLD  = 'payment_on_hold'
exports.PAYMENT_COMPLETE  = 'payment_complete'
exports.IN_PROGRESS  = 'in_progress'
exports.COMPLETE = 'complete'
