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
import { Trash2, Save } from 'lucide-react'
import { Counterparty } from '@/types/transactions';

export default function TransactionsGrid() {
    const { data: transactions, refetch } = useGetTransactions();
    const { mutateAsync: updateTransaction } = useUpdateTransaction();
    const { mutateAsync: insertTransaction } = useInsertTransaction();
    const { mutateAsync: deleteTransaction } = useDeleteTransaction();
    const { mutateAsync: addCounterparty } = useAddCounterparty(); // Assuming you have this hook
    const { mutateAsync: deleteCounterparty } = useDeleteCounterparty(); // Assuming you have this hook
    const [isLoading, setIsLoading] = useState(false);
    
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

    // Use useMemo for colDefs to react to changes in counterpartyList
    const colDefs = useMemo<ColDef<Transaction>[]>(() => ([
        { field: 'id', headerName: 'ID', editable: false, hide: true },
        { field: 'date', headerName: 'Date',editable: true },
        { field: 'currency_payout', headerName: 'Currency',editable: true },
        { 
            field: 'counter_party', 
            headerName: 'Counter Party',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { 
                values: counterpartyList.map(counterparty => counterparty.name) 
            },
            valueFormatter: (params) => {
                const counterparty = counterpartyList.find(c => c.name === params.value);
                return counterparty ? counterparty.name : params.value;
            }
        },

        { 
            field: 'usdc_quantity', 
            headerName: 'USDC Quantity',
            editable: true,
            valueFormatter: (params) => params.value?.toLocaleString() || ''
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
        { field: 'transaction_status', headerName: 'Status', editable: true },
        { 
            field: 'margin_percentage', 
            headerName: 'Margin (%)',
            editable: true,
            valueFormatter: (params) => params.value ? `${params.value.toFixed(2)}%` : ''
        },
        { 
            field: 'pnl_naira', 
            headerName: 'P&L (₦)',
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
                            className="text-green-500 hover:text-green-700 p-1"
                            title={isNewRow ? "Save new transaction" : "Update transaction"}
                            disabled={isLoading}
                        >
                            <Save size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(params.data.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete transaction"
                            disabled={isLoading}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                );
            }
        }
    ]), [counterpartyList, isLoading]); // Dependency array for useMemo

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
            setIsLoading(true);
            const isNewRow = typeof rowToSave.id === 'string' && rowToSave.id.startsWith('temp-');

            if (isNewRow) {
                const { id: tempId, ...newTransactionData } = rowToSave;
                const insertedTransaction = await insertTransaction(newTransactionData as Omit<Transaction, 'id'>);
                
                setRowData(prevRowData =>
                    prevRowData.map(row => (row.id === tempId ? { ...insertedTransaction, id: insertedTransaction.id } : row))
                );
                gridRef.current?.api.applyTransaction({ update: [{ ...rowToSave, id: insertedTransaction.id }] });
            } else if (rowToSave.id) {
                const { id, ...updates } = rowToSave;
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
            setIsLoading(false);
        }
    };

    const onCellValueChanged = async (event: CellValueChangedEvent<Transaction>) => {
        setRowData(prevRowData =>
            prevRowData.map(row => (row.id === event.data.id ? event.data : row))
        );
    };

    const handleDelete = async (id: string | number) => {
        try {
            setIsLoading(true);
            await deleteTransaction(id);
            setRowData(prevRowData => prevRowData.filter(row => row.id !== id));
            await refetch();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (transactions) {
            setRowData(transactions);
            initialDataFetchedFromDB.current = transactions;
        }
    }, [transactions]);

    const onAddRow = useCallback(() => {
        const tempId = `temp-${uuidv4()}`; 
        const newRow: Transaction = {
            id: tempId,
            date: new Date().toISOString().split('T')[0], 
            currency_payout: '',
            counter_party: '', // Initialize with an empty string for the dropdown
            usdc_quantity: 0,
            usdc_rate_naira: 0,
            selling_rate_naira: 0,
            selling_price_naira: 0,
            transaction_status: 'Pending', 
            margin_percentage: 0,
            pnl_naira: 0,
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
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
                    <div className="bg-white p-4 rounded-lg shadow-lg text-center text-black">
                        Saving changes...
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Transactions</h2>
                <button 
                    onClick={onAddRow} 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                    disabled={isLoading}
                >
                    <span>+</span> Add New Transaction
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