import json
import os

DATA_FILE = 'invoices.json'

def _load_data():
    """Loads all invoice data from the JSON file."""
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def _save_data(data):
    """Saves all invoice data to the JSON file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def get_all_invoices():
    """Retrieves all invoices."""
    return _load_data()

def get_invoice_by_id(invoice_id):
    """Retrieves a single invoice by its ID."""
    invoices = _load_data()
    for invoice in invoices:
        if invoice['id'] == invoice_id:
            return invoice
    return None

def save_invoice(invoice):
    """Saves a new invoice or updates an existing one."""
    invoices = _load_data()
    found = False
    for i, inv in enumerate(invoices):
        if inv['id'] == invoice['id']:
            invoices[i] = invoice
            found = True
            break
    if not found:
        invoices.append(invoice)
    _save_data(invoices)
    return invoice

def delete_invoice(invoice_id):
    """Deletes an invoice by its ID."""
    invoices = _load_data()
    initial_len = len(invoices)
    invoices = [invoice for invoice in invoices if invoice['id'] != invoice_id]
    if len(invoices) < initial_len:
        _save_data(invoices)
        return True
    return False
