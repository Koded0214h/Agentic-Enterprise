import pytest
import json
import os
from data_store import (
    _load_data, _save_data, get_all_invoices,
    get_invoice_by_id, save_invoice, delete_invoice,
    DATA_FILE
)

# Fixture to set up and tear down a clean data file for each test
@pytest.fixture(autouse=True)
def setup_teardown_data_file():
    # Setup: Ensure data file is empty before each test
    if os.path.exists(DATA_FILE):
        os.remove(DATA_FILE)
    _save_data([]) # Ensure it's an empty list
    yield
    # Teardown: Clean up after each test
    if os.path.exists(DATA_FILE):
        os.remove(DATA_FILE)

def test_load_data_empty_file():
    """Test loading data from a non-existent or empty file."""
    assert _load_data() == []

def test_save_and_load_data():
    """Test saving data to and loading data from the file."""
    test_data = [{'id': '1', 'client_name': 'Test Client'}]
    _save_data(test_data)
    loaded_data = _load_data()
    assert loaded_data == test_data

def test_get_all_invoices_empty():
    """Test retrieving all invoices when none exist."""
    assert get_all_invoices() == []

def test_get_all_invoices_with_data():
    """Test retrieving all invoices when data exists."""
    test_data = [{'id': '1', 'client_name': 'Client A'}, {'id': '2', 'client_name': 'Client B'}]
    _save_data(test_data)
    assert get_all_invoices() == test_data

def test_get_invoice_by_id_found():
    """Test retrieving a specific invoice by ID when it exists."""
    test_data = [{'id': '123', 'client_name': 'Client X'}]
    _save_data(test_data)
    invoice = get_invoice_by_id('123')
    assert invoice == {'id': '123', 'client_name': 'Client X'}

def test_get_invoice_by_id_not_found():
    """Test retrieving a specific invoice by ID when it does not exist."""
    test_data = [{'id': '123', 'client_name': 'Client X'}]
    _save_data(test_data)
    invoice = get_invoice_by_id('999')
    assert invoice is None

def test_save_new_invoice():
    """Test saving a brand new invoice."""
    new_invoice = {'id': 'new-1', 'client_name': 'New Client', 'status': 'pending'}
    saved_invoice = save_invoice(new_invoice)
    assert saved_invoice == new_invoice
    assert get_all_invoices() == [new_invoice]

def test_update_existing_invoice():
    """Test updating an existing invoice."""
    initial_invoice = {'id': 'update-1', 'client_name': 'Old Client', 'status': 'pending'}
    _save_data([initial_invoice])

    updated_invoice_data = {'id': 'update-1', 'client_name': 'Updated Client', 'status': 'paid'}
    saved_invoice = save_invoice(updated_invoice_data)
    assert saved_invoice == updated_invoice_data
    assert get_all_invoices() == [updated_invoice_data]

def test_delete_invoice_success():
    """Test deleting an existing invoice successfully."""
    test_data = [{'id': 'del-1', 'client_name': 'Client A'}, {'id': 'del-2', 'client_name': 'Client B'}]
    _save_data(test_data)
    
    result = delete_invoice('del-1')
    assert result is True
    assert get_all_invoices() == [{'id': 'del-2', 'client_name': 'Client B'}]

def test_delete_invoice_not_found():
    """Test deleting a non-existent invoice."""
    test_data = [{'id': 'del-1', 'client_name': 'Client A'}]
    _save_data(test_data)

    result = delete_invoice('non-existent')
    assert result is False
    assert get_all_invoices() == test_data
