const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarClient.tsx', 'utf8');

const searchTarget = `{selectedEvent.extendedProps.location && (
                  <div className="grid grid-cols-4 gap-2 px-1">
                    <span className="font-semibold text-gray-500">`;

const startIdx = code.indexOf('{selectedEvent.extendedProps.location &&');
const endIdx = code.indexOf('<div className="pt-2">', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const oldBlock = code.substring(startIdx, endIdx);
  const newBlock = `{selectedEvent.extendedProps.location && (
                <div className="grid grid-cols-4 gap-4 px-2">
                  <span className="font-semibold text-gray-500 text-lg">สถานที่:</span>
                  <span className="col-span-3 font-medium text-gray-900 text-lg">{selectedEvent.extendedProps.location}</span>
                </div>
              )}

              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 mt-4">
                <span className="font-semibold text-gray-700 block mb-3 text-lg">รายละเอียด:</span>
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-base">{selectedEvent.extendedProps.description || '-'}</div>
              </div>

              `;
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('src/components/CalendarClient.tsx', code, 'utf8');
  console.log('Replaced block successfully.');
} else {
  console.log('Could not find block', startIdx, endIdx);
}
