
import { GOOGLE_SHEETS_SCRIPT_URL } from '../constants';
import type { ConfirmedOrder } from '../types';

export const saveOrder = async (orderData: ConfirmedOrder): Promise<{ success: boolean; message: string; }> => {
    try {
        // Transform data for Google Sheets
        const sheetData = {
          ...orderData,
          items: orderData.items.map(item => `${item.name} x${item.quantity}`).join(', '),
          orderTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        };

        const response = await fetch(`${GOOGLE_SHEETS_SCRIPT_URL}?action=saveOrder`, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            // Send the transformed data
            body: JSON.stringify({ orderData: sheetData }),
        });

        if (!response.ok) {
            throw new Error(`Google Sheets API �^�����~�A���A�X: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || '�L�k�N�q���x�s�� Google Sheets');
        }

        return { success: true, message: result.message };

    } catch (error) {
        console.error('�x�s�q��� Google Sheet �ɵo�Ϳ��~:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: '�x�s�q��ɵo�ͥ������~' };
    }
};