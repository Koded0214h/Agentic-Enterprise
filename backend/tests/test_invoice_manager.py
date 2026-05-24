import pytest
import uuid
import datetime
from unittest.mock import patch, mock_open
from invoice_manager import (
    create_invoice,
    get_invoices,
    update_invoice_status,
    generate_invoice_content
)

# Mock the data_store functions to prevent actual file I/O during tests
@pytest.fixture(autouse=True)
def mock_data_store():
    with (
        patch('invoice_manager.get_all_invoices') as mock_get_all,
        patch('invoice_manager.save_invoice') as mock_save,
        patch('invoice_manager.get_invoice_by_id') as mock_get_by_id,
    ):
        yield mock_get_all, mock_save, mock_get_by_id

def test_create_invoice(mock_data_store):
    mock_get_all, mock_save, mock_get_by_id = mock_data_store
    mock_save.return_value = None # save_invoice doesn't return anything in the mock

    client_name = "Test Client"
    client_email = "test@example.com"
    amount = 150.00
    currency = "USD"
    due_date = "2023-12-31"
    items = [{'description': 'Service A', 'quantity': 1, 'unit_price': 100.0}, {'description': 'Service B', 'quantity': 1, 'unit_price': 50.0}]

    invoice = create_invoice(client_name, client_email, amount, currency, due_date, items)

    assert 'id' in invoice
    assert invoice['client_name'] == client_name
    assert invoice['client_email'] == client_email
    assert invoice['amount'] == amount
    assert invoice['currency'] == currency
    assert invoice['due_date'] == due_date
    assert invoice['items'] == items
    assert invoice['status'] == 'pending'
    assert 'created_at' in invoice
    mock_save.assert_called_once()
    assert mock_save.call_args[0][0]['client_name'] == client_name

def test_get_invoices(mock_data_store):
    mock_get_all, mock_save, mock_get_by_id = mock_data_store
    mock_get_all.return_value = [{'id': '1', 'client_name': 'Client 1'}]

    invoices = get_invoices()
    assert len(invoices) == 1
    assert invoices[0]['client_name'] == 'Client 1'
    mock_get_all.assert_called_once()

def test_update_invoice_status_success(mock_data_store):
    mock_get_all, mock_save, mock_get_by_id = mock_data_store
    existing_invoice = {
        'id': '123',
        'client_name': 'Client X',
        'status': 'pending',
        'amount': 100.0,
        'currency': 'USD',
        'due_date': '2023-12-31',
        'items': [{'description': 'Item', 'quantity': 1, 'unit_price': 100.0}],
        'client_email': 'x@example.com',
        'created_at': datetime.datetime.now().isoformat()
    }
    mock_get_by_id.return_value = existing_invoice

    updated_invoice = update_invoice_status('123', 'paid')

    assert updated_invoice['status'] == 'paid'
    mock_get_by_id.assert_called_once_with('123')
    mock_save.assert_called_once()
    assert mock_save.call_args[0][0]['status'] == 'paid'

def test_update_invoice_status_not_found(mock_data_store):
    mock_get_all, mock_save, mock_get_by_id = mock_data_store
    mock_get_by_id.return_value = None

    updated_invoice = update_invoice_status('non-existent', 'paid')
    assert updated_invoice is None
    mock_get_by_id.assert_called_once_with('non-existent')
    mock_save.assert_not_called()

def test_generate_invoice_content_success():
    invoice_data = {
        'id': 'INV-001',
        'client_name': 'Acme Corp',
        'client_email': 'acme@example.com',
        'amount': 250.00,
        'currency': 'USD',
        'due_date': '2024-01-15',
        'status': 'pending',
        'created_at': '2023-12-01T10:00:00',
        'items': [
            {'description': 'Consulting', 'quantity': 2, 'unit_price': 100.0},
            {'description': 'Travel', 'quantity': 1, 'unit_price': 50.0}
        ]
    }
    template_content = """
Invoice ID: {invoice_id}
Date: {created_at}

Client Name: {client_name}
Client Email: {client_email}

Items:
{items}
Total Amount: {currency}{amount:.2f}
Due Date: {due_date}
Status: {status}
"""
    with patch('builtins.open', mock_open(read_data=template_content)) as mock_file:
        content = generate_invoice_content(invoice_data, 'invoice_template.txt')
        mock_file.assert_called_once_with('invoice_template.txt', 'r')
        assert "Invoice ID: INV-001" in content
        assert "Client Name: Acme Corp" in content
        assert "Total Amount: USD250.00" in content
        assert "Status: PENDING" in content
        assert "- Consulting (Qty: 2) @ USD100.00 = USD200.00" in content
        assert "- Travel (Qty: 1) @ USD50.00 = USD50.00" in content

def test_generate_invoice_content_template_not_found():
    invoice_data = {
        'id': 'INV-001',
        'client_name': 'Acme Corp',
        'client_email': 'acme@example.com',
        'amount': 250.00,
        'currency': 'USD',
        'due_date': '2024-01-15',
        'status': 'pending',
        'created_at': '2023-12-01T10:00:00',
        'items': []
    }
    with patch('builtins.open', side_effect=FileNotFoundError):
        content = generate_invoice_content(invoice_data, 'non_existent_template.txt')
        assert content == "Invoice template not found."
