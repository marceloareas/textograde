import { Table } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';
import React, { useState } from 'react';
import { Root } from './styles';

interface CustomTableProps {
    dataSource: any[];
    columns: any[];
}

const CustomTable: React.FC<CustomTableProps> = ({ dataSource, columns }) => {
    const [pagination, setPagination] = useState<PaginationProps>({
        current: 1,
        pageSize: 10,
    });

    const handleTableChange = (pagination: PaginationProps) => {
        setPagination(pagination);
    };

    return (
        <Root>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={pagination}
                onChange={handleTableChange}
                style={{ minHeight: "100%" }}
            />
        </Root>
    );
};

export default CustomTable;