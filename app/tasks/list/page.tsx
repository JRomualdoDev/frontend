// app/list-task/page.tsx
'use client'

import Layout from "@/components/layout";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useTasks } from "@/lib/api/use-task";

export default function ListTask() {
    const { data, isLoading, error } = useTasks()

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading...</div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">
                        An error has occurred: {error.message}
                    </div>
                </div>
            </Layout>
        )
    }

    if (!data) {
        return (
            <Layout>
                <div className="p-6">
                    <p>Data is null or undefined</p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="p-6">
                <Table>
                    <TableCaption>A list of your recent Tasks.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data && Array.isArray(data.data)
                            ? data.data.map((task, index) => {
                                console.log(`Task ${index}:`, task)
                                return (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">
                                            {task.title}
                                        </TableCell>
                                        <TableCell>
                                            {task.description}
                                        </TableCell>
                                        <TableCell>
                                            {task.status}
                                        </TableCell>
                                        <TableCell>
                                            {task.priority}
                                        </TableCell>
                                        <TableCell>
                                            {task.created_at}
                                        </TableCell>
                                        <TableCell>
                                            {task.updated_at}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                            : <></>
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={5}>Total</TableCell>
                            <TableCell className="text-right">{data.length}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </Layout>
    )
}