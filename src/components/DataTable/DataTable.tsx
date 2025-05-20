import React from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface DataTableProps {
    data: any[];
    columns: { field: string; header: string }[];
    headerTitle?: string;
}
export const CustomDataTable: React.FC<DataTableProps> = ({ data, columns, headerTitle }) => {
  return (
    <div className='p-4 bg-white rounded-md shadow-md'>
        <DataTable value={data} header={headerTitle} className="p-datatable-customers">
            {columns.map((col) => (
                <Column key={col.field} field={col.field} header={col.header} />
            ))}
        </DataTable>
    </div>
  )
}
