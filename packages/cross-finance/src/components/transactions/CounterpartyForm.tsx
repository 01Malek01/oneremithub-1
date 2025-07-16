import React from 'react'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '../ui/input';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from '../ui/button';
import { Counterparty } from '@/types/transactions';
import { toast } from 'sonner';
type Props = {
    setCounterparties : React.Dispatch<React.SetStateAction<Counterparty[]>>;
}
export default function CounterpartyForm({ setCounterparties }:Props) {
    const formSchema = z.object({
        name: z.string().min(1, "Name is required"),
    });
    const formCounterparty = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });
    const onSubmitCounterparty = (data: z.infer<typeof formSchema>) => {
        setCounterparties((prev) => [...prev, { id: prev.length + 1, name: data.name }]);
        toast.success("Counterparty created successfully");
        formCounterparty.reset();
    };
  return (
    <div className='mt-5'>
        <Form {...formCounterparty}>
            <h2 className=' text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b'> Create Counterparty </h2>
                <form onSubmit={formCounterparty.handleSubmit(onSubmitCounterparty)}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                                control={formCounterparty.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter counterparty name"
                                                className="resize-y w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-md focus:ring-1 placeholder-gray-400 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                     </div>
                       
                       <Button type="submit" className="px-6 mt-2 bg-black hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 text-white transition-colors">
                           Create Counterparty
                       </Button>
                </form>
             </Form>
    </div>
  )
}
