import unittest
from mrr_calculator import calculate_mrr

class TestMRRCalculator(unittest.TestCase):

    def test_empty_list(self):
        self.assertEqual(calculate_mrr([]), 0.0)

    def test_single_subscription(self):
        self.assertEqual(calculate_mrr([100.0]), 100.0)

    def test_multiple_subscriptions(self):
        self.assertEqual(calculate_mrr([100.0, 50.50, 25.00]), 175.50)

    def test_subscriptions_with_zero(self):
        self.assertEqual(calculate_mrr([100.0, 0.0, 50.0]), 150.0)

    def test_float_subscriptions(self):
        self.assertAlmostEqual(calculate_mrr([99.99, 0.01]), 100.00)

    def test_large_number_of_subscriptions(self):
        subscriptions = [10.0] * 1000
        self.assertEqual(calculate_mrr(subscriptions), 10000.0)

    def test_type_error_non_list_input(self):
        with self.assertRaises(TypeError):
            calculate_mrr("not a list")
        with self.assertRaises(TypeError):
            calculate_mrr(123)
        with self.assertRaises(TypeError):
            calculate_mrr(None)

    def test_type_error_non_numeric_amounts(self):
        with self.assertRaises(TypeError):
            calculate_mrr([100.0, "abc"])
        with self.assertRaises(TypeError):
            calculate_mrr([None, 50.0])

    def test_value_error_negative_amounts(self):
        with self.assertRaises(ValueError):
            calculate_mrr([100.0, -50.0])
        with self.assertRaises(ValueError):
            calculate_mrr([-10.0])

if __name__ == '__main__':
    unittest.main()
