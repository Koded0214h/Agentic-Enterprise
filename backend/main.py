import argparse
import sys
from invoice_manager import (
    create_invoice,
    get_invoices,
    update_invoice_status,
    generate_invoice_content
)

def main():
    parser = argparse.ArgumentParser(description='Invoice and Payment Tracker CLI')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Create Invoice command
    parser_create = subparsers.add_parser('create', help='Create a new invoice')
    parser_create.add_argument('client_name', help='Name of the client')
    parser_create.add_argument('client_email', help='Email of the client')
    parser_create.add_argument('amount', type=float, help='Total amount of the invoice')
    parser_create.add_argument('currency', help='Currency of the invoice (e.g., USD, EUR)')
    parser_create.add_argument('due_date', help='Due date in YYYY-MM-DD format')
    parser_create.add_argument('--items', nargs='+', required=True, help='Invoice items. Format: "description:quantity:unit_price" (e.g., "Web Design:1:1000.0")')

    # List Invoices command
    parser_list = subparsers.add_parser('list', help='List all invoices')
    parser_list.add_argument('--show-details', action='store_true', help='Show full invoice details')

    # Update Invoice Status command
    parser_update = subparsers.add_parser('update', help='Update invoice status')
    parser_update.add_argument('invoice_id', help='ID of the invoice to update')
    parser_update.add_argument('new_status', choices=['pending', 'paid', 'overdue'], help='New status for the invoice')

    # View Invoice command
    parser_view = subparsers.add_parser('view', help='View a specific invoice')
    parser_view.add_argument('invoice_id', help='ID of the invoice to view')

    args = parser.parse_args()

    if args.command == 'create':
        # Parse items
        invoice_items = []
        for item_str in args.items:
            try:
                desc, qty, price = item_str.split(':')
                invoice_items.append({
                    'description': desc,
                    'quantity': int(qty),
                    'unit_price': float(price)
                })
            except ValueError:
                print(f"Error: Invalid item format '{item_str}'. Use 'description:quantity:unit_price'.")
                sys.exit(1)
        
        # Validate total amount matches items sum
        calculated_amount = sum(item['quantity'] * item['unit_price'] for item in invoice_items)
        if abs(calculated_amount - args.amount) > 0.01: # Allow for small floating point differences
            print(f"Error: Provided amount ({args.amount} {args.currency}) does not match the sum of items ({calculated_amount} {args.currency}).")
            sys.exit(1)

        invoice = create_invoice(
            client_name=args.client_name,
            client_email=args.client_email,
            amount=args.amount,
            currency=args.currency,
            due_date=args.due_date,
            items=invoice_items
        )
        print(f"Invoice created successfully with ID: {invoice['id']}")
        print(generate_invoice_content(invoice))

    elif args.command == 'list':
        invoices = get_invoices()
        if not invoices:
            print("No invoices found.")
            return

        if args.show_details:
            for inv in invoices:
                print(generate_invoice_content(inv))
                print("---")
        else:
            print("ID                                   | Client Name      | Amount   | Status  | Due Date  ")
            print("-------------------------------------|------------------|----------|---------|----------")
            for inv in invoices:
                print(f"{inv['id'][:8]}...{inv['id'][-8:]} | {inv['client_name'][:16]:<16} | {inv['currency']}{inv['amount']:<7.2f} | {inv['status']:<7} | {inv['due_date']:<10}")

    elif args.command == 'update':
        invoice = update_invoice_status(args.invoice_id, args.new_status)
        if invoice:
            print(f"Invoice {args.invoice_id} status updated to '{args.new_status}'.")
            print(generate_invoice_content(invoice))
        else:
            print(f"Error: Invoice with ID '{args.invoice_id}' not found.")

    elif args.command == 'view':
        invoice = get_invoice_by_id(args.invoice_id) # Assuming get_invoice_by_id is available in invoice_manager
        if invoice:
            print(generate_invoice_content(invoice))
        else:
            print(f"Error: Invoice with ID '{args.invoice_id}' not found.")

if __name__ == "__main__":
    main()
