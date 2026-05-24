import datetime
import uuid

from data_store import get_all_invoices, save_invoice, get_invoice_by_id


def create_invoice(
    client_name,
    client_email,
    amount,
    currency,
    due_date,
    items,
):
    """Creates a new invoice and saves it."""
    invoice_id = str(uuid.uuid4())
    invoice = {
        "id": invoice_id,
        "client_name": client_name,
        "client_email": client_email,
        "amount": float(amount),
        "currency": currency,
        "due_date": due_date,
        "items": items,
        "status": "pending",
        "created_at": datetime.datetime.now().isoformat(),
    }
    save_invoice(invoice)
    return invoice


def get_invoices():
    """Returns a list of all invoices."""
    return get_all_invoices()


def update_invoice_status(invoice_id, new_status):
    """Updates the status of an existing invoice."""
    invoice = get_invoice_by_id(invoice_id)
    if invoice:
        invoice["status"] = new_status
        save_invoice(invoice)
        return invoice
    return None


def generate_invoice_content(invoice, template_path="invoice_template.txt"):
    """Generates the printable content of an invoice from a template."""
    try:
        with open(template_path, "r") as f:
            template = f.read()
    except FileNotFoundError:
        return "Invoice template not found."

    items_str = ""
    for item in invoice["items"]:
        items_str += (
            f"- {item['description']} (Qty: {item['quantity']}) "
            f"@ {invoice['currency']}{item['unit_price']:.2f} = "
            f"{invoice['currency']}{item['quantity'] * item['unit_price']:.2f}\n"
        )

    return template.format(
        invoice_id=invoice["id"],
        client_name=invoice["client_name"],
        client_email=invoice["client_email"],
        amount=invoice["amount"],
        currency=invoice["currency"],
        due_date=invoice["due_date"],
        status=invoice["status"].upper(),
        created_at=invoice["created_at"].split("T")[0],
        items=items_str,
    )
