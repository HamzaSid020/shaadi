import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface Column<T> {
  id: keyof T | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

interface Filter {
  field: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  filters?: Filter[];
  onAdd?: () => void;
  onRowClick?: (row: T) => void;
  getRowActions?: (row: T) => React.ReactNode;
  searchFields?: (keyof T)[];
}

type Order = 'asc' | 'desc';

export function DataTable<T extends { id: string }>({
  title,
  columns,
  data,
  filters = [],
  onAdd,
  onRowClick,
  getRowActions,
  searchFields = [],
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T | ''>('');
  const [filteredData, setFilteredData] = useState<T[]>(data);

  useEffect(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(row =>
        searchFields.some(field =>
          String(row[field]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filterValues).forEach(([field, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(row => String(row[field as keyof T]) === value);
      }
    });

    // Apply sorting
    if (orderBy) {
      filtered.sort((a, b) => {
        const aValue = a[orderBy as keyof T];
        const bValue = b[orderBy as keyof T];
        
        if (order === 'asc') {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      });
    }

    setFilteredData(filtered);
    setPage(0);
  }, [data, searchQuery, filterValues, order, orderBy]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Toolbar sx={{ pl: 2, pr: 1, gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
          {title}
        </Typography>

        <TextField
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 200 }}
        />

        {filters.map((filter) => (
          <FormControl key={filter.field} size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={filterValues[filter.field] || 'all'}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            >
              <MenuItem value="all">All {filter.label}s</MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
          >
            Add New
          </Button>
        )}
      </Toolbar>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id as keyof T)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    if (column.id === 'actions') {
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {getRowActions?.(row)}
                        </TableCell>
                      );
                    }
                    
                    const value = row[column.id as keyof T];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
} 