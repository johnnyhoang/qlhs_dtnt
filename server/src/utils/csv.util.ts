/**
 * Utility to convert an array of objects to a CSV string.
 * Supporting UTF-8 with BOM for Excel compatibility.
 */
export const convertToCSV = (data: any[], columns: { key: string; header: string }[]): string => {
    if (!data || !data.length) {
        return '\uFEFF' + columns.map(col => `"${col.header}"`).join(',');
    }

    const csvRows = [];

    // Add headers
    csvRows.push(columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(','));

    // Add data rows
    for (const row of data) {
        const values = columns.map(col => {
            let val = row[col.key];
            
            // Handle nested objects (e.g., 'nguoi_cap_nhat.ho_ten') if flat key is not found
            if (val === undefined && col.key.includes('.')) {
                const keys = col.key.split('.');
                val = row;
                for (const k of keys) {
                    val = val ? val[k] : undefined;
                }
            }

            if (val === null || val === undefined) {
                val = '';
            }
            
            // Escape double quotes and wrap in double quotes
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    // Add Byte Order Mark (BOM) for Excel
    return '\uFEFF' + csvRows.join('\n');
};
