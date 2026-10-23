export function formatNumber(value: number | undefined) {
  return Number(value ?? 0).toLocaleString('th-TH');
}

export function formatDateTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('th-TH', { hour12: false });
}

export function movementLabel(type?: string) {
  const map: Record<string, string> = {
    Receive: 'รับเข้า',
    Issue: 'จ่ายออก',
    TransferIn: 'โอนเข้า',
    TransferOut: 'โอนออก',
    Adjust: 'ปรับยอด',
    1: 'รับเข้า',
    2: 'จ่ายออก',
    3: 'โอนออก',
    4: 'โอนเข้า',
    5: 'ปรับยอด',
  };
  return map[String(type)] ?? type ?? '-';
}
