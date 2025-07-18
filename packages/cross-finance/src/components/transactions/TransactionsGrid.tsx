import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react'; 
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Transaction } from '@/types/transactions';
import useGetCounterparties from '@/hooks/useGetCounterparties';
import useAddCounterparty from '@/hooks/useAddCounterparty';
import useDeleteCounterparty from '@/hooks/useDeleteCounterparty';    
import useGetTransactions from '../../hooks/useGetTransactions';
import useUpdateTransaction from '@/hooks/useUpdateTransaction';
import useInsertTransaction from '@/hooks/useInsertTransaction';
import useDeleteTransaction from '@/hooks/useDeleteTransaction';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Save, Plus, Loader2 } from 'lucide-react';
import { Counterparty } from '@/types/transactions';

export default function TransactionsGrid() {
    const { data: transactions, refetch, isLoading: isFetching } = useGetTransactions();
    const { mutateAsync: updateTransaction } = useUpdateTransaction();
    const { mutateAsync: insertTransaction } = useInsertTransaction();
    const { mutateAsync: deleteTransaction } = useDeleteTransaction();

    const [isSaving, setIsSaving] = useState(false);
    
    const [rowData, setRowData] = useState<Transaction[]>([]);
    const gridRef = useRef<AgGridReact<Transaction>>(null);
    const initialDataFetchedFromDB = useRef<Transaction[]>([]);

    const { data: counterpartiesData = [], refetch: refetchCounterparties } = useGetCounterparties();
    const counterparties = counterpartiesData as Counterparty[];
    const [counterpartyList, setCounterpartyList] = useState<Counterparty[]>([]);

    // Update local state when counterparties data changes
    useEffect(() => {
        setCounterpartyList(counterparties);
    }, [counterparties]);

    // Calculate margin percentage for a transaction
    const calculateMarginPercentage = useCallback((transaction: Transaction): number => {
        const costPrice = transaction.usdc_quantity * transaction.usdc_rate_naira;
        const pnl = transaction.selling_price_naira - costPrice;
        return costPrice !== 0 ? (pnl / costPrice) * 100 : 0;
    }, []);

    // Update row data with calculated margin
    const updateRowWithCalculatedValues = useCallback((transaction: Transaction): Transaction => {
        return {
            ...transaction,
            margin_percentage: calculateMarginPercentage(transaction)
        };
    }, [calculateMarginPercentage]);

    // Use useMemo for colDefs to react to changes in counterpartyList
    const colDefs = useMemo<ColDef<Transaction>[]>(() => ([
        { field: 'id', headerName: 'ID', editable: false, hide: true },
        { field: 'date', headerName: 'Date',editable: true },
        { field: 'currency_payout', headerName: 'Currency',editable: true, 
            cellEditor: 'agSelectCellEditor',
             cellEditorParams: { 
                 values: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY', 'RMB'] 
             }
         },
        { 
            field: 'counterparty_id', 
            headerName: 'Counter Party',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { 
                values: counterpartyList.map(counterparty => counterparty.id) 
            },
            valueFormatter: (params) => {
                const counterparty = counterpartyList.find(c => c.id === params.value);
                return counterparty ? counterparty.name : params.value;
            }
        },
        { 
            field: 'usdc_quantity', 
            headerName: 'USDC Quantity',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || '',
        },
        { 
            field: 'usdc_rate_naira', 
            headerName: 'USDC Rate (₦)',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || ''
        },
        { 
            field: 'selling_rate_naira', 
            headerName: 'Selling Rate (₦)',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || ''
        },
        { 
            field: 'selling_price_naira', 
            headerName: 'Selling Price (₦)',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || ''
        },
        { 
            field: 'cost_price_naira', 
            headerName: 'Cost Price (₦)',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || '',
            valueGetter: (params) => params.data.usdc_quantity * params.data.usdc_rate_naira,
        },
        { field: 'transaction_status', headerName: 'Status', editable: true },
        { 
            field: 'margin_percentage', 
            headerName: 'Margin (%)',
            editable: false, // Set to false since it's calculated
            valueFormatter: (params) => params.value ? `${params.value.toFixed(2)}%` : '0%',
        },
        { 
            field: 'pnl_naira', 
            headerName: 'P&L (₦)',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || '',
            valueGetter: (params) => params.data.selling_price_naira - params.data.cost_price_naira,
        },
        { 
            field: 'note', 
            headerName: 'Note',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || ''
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            filter: false,
            editable: false,
            width: 100,
            cellRenderer: (params: any) => {
                const isNewRow = typeof params.data.id === 'string' && params.data.id.startsWith('temp-');
                return (
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => handleSaveOrUpdate(params.data)}
                            className="text-green-500 hover:text-green-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isNewRow ? "Save new transaction" : "Update transaction"}
                            disabled={isSaving || isFetching}
                        >
                            <Save size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(params.data.id)}
                            className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete transaction"
                            disabled={isSaving || isFetching}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                );
            }
        }
    ]), [counterpartyList, isSaving, isFetching]);

    const defaultColDef = {
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        filter: true,
    };

    const refreshCounterparties = async () => {
        await refetchCounterparties();
    };

    const handleSaveOrUpdate = async (rowToSave: Transaction) => {
        try {
            setIsSaving(true);
            const isNewRow = typeof rowToSave.id === 'string' && rowToSave.id.startsWith('temp-');
            
            // Calculate margin before saving
            const updatedRow = updateRowWithCalculatedValues(rowToSave);
            console.log("rowToSave", updatedRow);

            if (isNewRow) {
                const { id: tempId, ...newTransactionData } = updatedRow;
                const insertedTransaction = await insertTransaction(newTransactionData as Omit<Transaction, 'id'>);
                
                setRowData(prevRowData =>
                    prevRowData.map(row => (row.id === tempId ? { ...insertedTransaction, id: insertedTransaction.id } : row))
                );
                gridRef.current?.api.applyTransaction({ update: [{ ...updatedRow, id: insertedTransaction.id }] });
            } else if (updatedRow.id) {
                const { id, ...updates } = updatedRow;
                await updateTransaction({
                    id,
                    updates: updates
                });
            }
            await refetch();
        } catch (error) {
            console.error('Error saving/updating transaction:', error);
            setRowData(prev => [...prev]); 
        } finally {
            setIsSaving(false);
        }
    };

    const onCellValueChanged = async (event: CellValueChangedEvent<Transaction>) => {
        // Update the row data with calculated margin
        const updatedRow = updateRowWithCalculatedValues(event.data);
        
        setRowData(prevRowData =>
            prevRowData.map(row => (row.id === updatedRow.id ? updatedRow : row))
        );
        
        // Update the grid display
        gridRef.current?.api.applyTransaction({ update: [updatedRow] });
    };

    const handleDelete = async (id: string | number) => {
        try {
            setIsSaving(true);
            await deleteTransaction(id);
            setRowData(prevRowData => prevRowData.filter(row => row.id !== id));
            await refetch();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (transactions) {
            // Update all transactions with calculated margins
            const updatedTransactions = transactions.map(updateRowWithCalculatedValues);
            setRowData(updatedTransactions);
            initialDataFetchedFromDB.current = updatedTransactions;
        }
    }, [transactions, updateRowWithCalculatedValues]);

    const onAddRow = useCallback(() => {
        const tempId = `temp-${uuidv4()}`; 
        const newRow: Transaction = {
            id: tempId,
            date: new Date().toISOString().split('T')[0], 
            currency_payout: '',
            counterparty_id: '',
            usdc_quantity: 0,
            usdc_rate_naira: 0,
            selling_rate_naira: 0,
            selling_price_naira: 0,
            transaction_status: 'Pending', 
            margin_percentage: 0,
            pnl_naira: 0,
            note: '',
            cost_price_naira: 0,
        };

        setRowData(prevRowData => [...prevRowData, newRow]);
        gridRef.current?.api.applyTransaction({ add: [newRow] });

        if (gridRef.current?.api) {
            const newRowIndex = rowData.length;
            gridRef.current.api.ensureIndexVisible(newRowIndex); 
            gridRef.current.api.setFocusedCell(newRowIndex, 'date'); 
        }
    }, [rowData]);
    
    return (
        <div className='h-[600px] w-full relative'>
            {(isSaving || isFetching) && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                        <p className="text-gray-800">
                            {isFetching ? 'Loading transactions...' : 'Saving changes...'}
                        </p>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-2 mt-5 px-4">
                <h2 className="text-xl font-semibold">Transactions</h2>
                <button 
                    onClick={onAddRow} 
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                    disabled={isSaving || isFetching}
                >
                    <Plus size={18} />
                    <span>Add New Transaction</span>
                </button>
            </div>
           
            <AgGridReact 
                ref={gridRef}
                className="ag-theme-alpine" 
                rowData={rowData}
                defaultColDef={{
                    ...defaultColDef,
                    editable: true,
                }}
                columnDefs={colDefs}
                animateRows={true}
                pagination={true}
                paginationPageSize={10}
                onCellValueChanged={onCellValueChanged}
                singleClickEdit={true}
                stopEditingWhenCellsLoseFocus={true}
            />
        </div>
    );
}