def calculate_mrr(subscription_amounts):
    """
    Calculates the Monthly Recurring Revenue (MRR) from a list of subscription amounts.

    Args:
        subscription_amounts (list): A list of numerical subscription amounts.

    Returns:
        float: The total Monthly Recurring Revenue.
    """
    if not isinstance(subscription_amounts, list):
        raise TypeError("Input must be a list of subscription amounts.")
    
    for amount in subscription_amounts:
        if not isinstance(amount, (int, float)):
            raise TypeError("All subscription amounts must be numbers (int or float).")
        if amount < 0:
            raise ValueError("Subscription amounts cannot be negative.")

    return sum(subscription_amounts)

if __name__ == '__main__':
    # Example usage
    subscriptions = [100.00, 50.50, 25.00, 75.25]
    mrr = calculate_mrr(subscriptions)
    print(f"Monthly Recurring Revenue: ${mrr:.2f}")

    subscriptions_empty = []
    mrr_empty = calculate_mrr(subscriptions_empty)
    print(f"Monthly Recurring Revenue (empty list): ${mrr_empty:.2f}")

    subscriptions_single = [200.00]
    mrr_single = calculate_mrr(subscriptions_single)
    print(f"Monthly Recurring Revenue (single subscription): ${mrr_single:.2f}")
