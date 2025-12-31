
/**
 * Service untuk komunikasi dengan Google Sheets via Google Apps Script
 */

export const googleSheetsService = {
  /**
   * Mengambil semua data dari Spreadsheet
   */
  fetchAllData: async (webAppUrl: string) => {
    try {
      console.log('Attempting to fetch from:', webAppUrl);
      const response = await fetch(`${webAppUrl}?action=readAll`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received from cloud:', data);
      
      // Jika data kosong atau bukan objek yang diharapkan
      if (!data || typeof data !== 'object') {
        console.warn('Received invalid data format from Apps Script');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('CRITICAL: Error fetching from Google Sheets:', error);
      // Jangan throw agar aplikasi tidak crash, biarkan UI menangani state null
      return null;
    }
  },

  /**
   * Menyimpan transaksi atau perubahan data ke Spreadsheet
   */
  postData: async (webAppUrl: string, action: string, data: any) => {
    try {
      console.log(`Posting action [${action}] to cloud...`);
      const response = await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // Apps Script mengharuskan no-cors untuk POST sederhana
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });
      
      // no-cors tidak memberikan respon yang bisa dibaca, 
      // asumsikan sukses jika tidak ada error network
      return true;
    } catch (error) {
      console.error('Error posting to Google Sheets:', error);
      throw error;
    }
  }
};
