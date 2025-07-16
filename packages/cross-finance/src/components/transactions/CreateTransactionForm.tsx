import React, { useEffect, useState } from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this
import { format } from "date-fns"; // For date formatting
import { Counterparty, Transaction } from '@/types/transactions'; 
import CounterpartyForm from './CounterpartyForm';
type Props = {
     transactions : Transaction[];
     setTransactions : React.Dispatch<React.SetStateAction<Transaction[]>>;
     counterparties : Counterparty[];
     setCounterparties : React.Dispatch<React.SetStateAction<Counterparty[]>>;
}
export default function CreateTransactionForm({ transactions,setTransactions,counterparties,setCounterparties}:Props) {
const [values , setValues] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    currency_payout: undefined,
    usdc_quantity: 0,
    usdc_rate_naira: 0,
    selling_rate_naira: 0,
    selling_price_naira: 0,
    transaction_status: undefined,
    counterparty_id: undefined,
    note: "",
    cost_price_naira: 0,
    pnl_naira: 0,
    margin_percentage: 0,
})

    // Zod schema for validation
    const formSchema = z.object({
        date: z.string().min(1, "Date is required"), // Use string for date input, convert to Date object on submit if needed
        currency_payout: z.enum(["GBP", "USD", "EUR", "CAD"], {
            errorMap: () => ({ message: "Please select a currency." }),
        }),
        usdc_quantity: z.preprocess(
            (val) => Number(val),
            z.number().min(0.01, "USDC Quantity must be greater than 0")
        ),
        usdc_rate_naira: z.preprocess(
            (val) => Number(val),
            z.number().min(0.01, "USDC Rate (Naira) must be greater than 0")
        ),
        selling_rate_naira: z.preprocess(
            (val) => Number(val),
            z.number().min(0.01, "Selling Rate (Naira) must be greater than 0")
        ),
        selling_price_naira: z.preprocess(
            (val) => Number(val),
            z.number().min(0.01, "Selling Price (Naira) must be greater than 0")
        ),
        transaction_status: z.enum(["Pending", "Completed"], {
            errorMap: () => ({ message: "Please select a status." }),
        }),
        counterparty_id: z.string().min(1, "Please select a counterparty"),
        note: z.string().optional(), // Note can be optional and empty

        // Calculated fields (will be read-only in UI, not directly validated by Zod for input)
        // We'll calculate these inside the form's watch/useEffect and ensure they're numbers for the final data.
        cost_price_naira: z.number().optional(),
        pnl_naira: z.number().optional(),
        margin_percentage: z.number().optional(),
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"), // Format date for input default
            currency_payout: undefined, // Use undefined for initial empty select
            usdc_quantity: 0,
            usdc_rate_naira: 0,
            selling_rate_naira: 0,
            selling_price_naira: 0,
            transaction_status: undefined, // Use undefined for initial empty select
            counterparty_id: undefined, // Use undefined for initial empty select
            note: "",
            cost_price_naira: 0,
            pnl_naira: 0,
            margin_percentage: 0,
        },
    });

    // Watch for changes in relevant fields to perform calculations
    const usdcQuantity = form.watch("usdc_quantity");
    const usdcRateNaira = form.watch("usdc_rate_naira");
    const sellingPriceNaira = form.watch("selling_price_naira");

    useEffect(() => {
        const costPrice = (usdcQuantity || 0) * (usdcRateNaira || 0);
        form.setValue("cost_price_naira", costPrice);

        const pnl = (sellingPriceNaira || 0) - costPrice;
        form.setValue("pnl_naira", pnl);

        let marginPercentage = 0;
        if (costPrice > 0) {
            marginPercentage = (pnl / costPrice) * 100;
        }
        form.setValue("margin_percentage", marginPercentage);
    }, [usdcQuantity, usdcRateNaira, sellingPriceNaira, form]);

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        // Here you would typically send `data` to your Supabase backend
        console.log("Form Data Submitted:", data);

        const submissionData = {
            ...data,
            date: new Date(data.date),
            usdc_quantity: Number(data.usdc_quantity),
            usdc_rate_naira: Number(data.usdc_rate_naira),
            selling_rate_naira: Number(data.selling_rate_naira),
            selling_price_naira: Number(data.selling_price_naira),
        };
        console.log("Data ready for Supabase:", submissionData);

        form.reset();
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b">Create New Transaction</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Date */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Date of Transaction</FormLabel>
                                        <FormControl>
                                            <div className="relative flex items-center justify-center">
                                                <Input
                                                    type="date"
                                                    className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400 transition-colors"
                                                    {...field}
                                                    value={field.value ? field.value : format(new Date(), "yyyy-MM-dd")}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Currency Payout */}
                            <FormField
                                control={form.control}
                                name="currency_payout"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Currency Payout</FormLabel>
                                        <Select  onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full bg-white text-black focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors">
                                                    <SelectValue placeholder="Select currency" className="text-gray-500" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='bg-white text-black'>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="CAD">CAD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* USDC Quantity */}
                            <FormField
                                control={form.control}
                                name="usdc_quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">USDC Quantity Used</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.000001"
                                                    placeholder="Enter USDC amount"
                                                    className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400 transition-colors"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    value={field.value === 0 ? "" : field.value}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Amount of USDC used for the payout
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* USDC Rate (Naira) */}
                            <FormField
                                control={form.control}
                                name="usdc_rate_naira"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">USDC Rate (₦)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter USDC rate in Naira"
                                                    className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400 transition-colors"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    value={field.value === 0 ? "" : field.value}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Rate at which USDC was acquired in Naira.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Cost Price (in Naira) - Auto Calculated */}
                            <FormField
                                control={form.control}
                                name="cost_price_naira"
                            
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₦)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={field.value.toFixed(2)}
                                                    readOnly
                                                    className="w-full px-4 py-2 text-black  bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 cursor-not-allowed transition-colors"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Total cost in Naira to acquire required USDC (USDC Quantity × USDC Rate).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Selling Rate (Naira) */}
                            <FormField
                                control={form.control}
                                name="selling_rate_naira"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Selling Rate (₦)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter selling rate in Naira"
                                                    className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400 transition-colors"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    value={field.value === 0 ? "" : field.value}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Rate at which the foreign currency is sold to the customer.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Selling Price (Naira) */}
                            <FormField
                                control={form.control}
                                name="selling_price_naira"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₦)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter total selling price in Naira"
                                                    className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400 transition-colors"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    value={field.value === 0 ? "" : field.value}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Amount customer paid in Naira.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* PNL - Auto Calculated */}
                            <FormField
                                control={form.control}
                                name="pnl_naira"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Profit/Loss (₦)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={field.value.toFixed(2)}
                                                    readOnly
                                                    className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 cursor-not-allowed transition-colors"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Profit or loss from the transaction (Selling Price - Cost Price).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}   
                            />

                            {/* Margin % - Auto Calculated */}
                            <FormField
                                control={form.control}
                                name="margin_percentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Margin %</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={field.value.toFixed(2)}
                                                    readOnly
                                                    className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600  cursor-not-allowed transition-colors"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-sm text-gray-500">
                                            Margin on the transaction [(PNL / Cost Price) × 100].
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Transaction Status */}
                            <FormField
                                control={form.control}
                                name="transaction_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Transaction Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full text-black bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors">
                                                    <SelectValue placeholder="Select status" className="text-gray-500" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Counterparty */}
                            <FormField
                                control={form.control}
                                name="counterparty_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Counterparty</FormLabel>
                                        <Select  onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full text-black bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors">
                                                    <SelectValue placeholder="Select exchange partner or create a new one" className="text-black" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {counterparties.map((cp) => (
                                                    <SelectItem key={cp.id} value={cp.id}>
                                                        {cp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Note */}
                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter any additional notes or context"
                                                className="resize-y min-h-[100px] w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                            <div className="flex justify-center mx-auto w-full text-center pt-4 mt-6">
                                <Button type="submit" className="px-6 bg-black hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 text-white transition-colors">
                                    Create Transaction
                                </Button>
                            </div>
                    </form>
                </Form>

             {/*   Create Counterparty Form */}
           <CounterpartyForm setCounterparties={setCounterparties} />
            </div>
        </div>
    );
}