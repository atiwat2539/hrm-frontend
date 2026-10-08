const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Remove ArrowUp, ArrowDown from Manage Column
code = code.replace(
  /\{\/\* Move Up\/Down \*\/\}[\s\S]*?<\/div>/g, 
  ''
);

// 2. Adjust Imports
if (code.includes('ArrowUp')) {
  code = code.replace(', ArrowUp, ArrowDown', ', GripVertical');
} else if (!code.includes('GripVertical')) {
  code = code.replace('} from \'lucide-react\'', ', GripVertical } from \'lucide-react\'');
}

// 3. Add Drag Logic
const handleMoveRegex = /const handleMove = async \([\s\S]*?catch \(err: any\) \{[\s\S]*?\}[\s\S]*?\};/;
const dragLogic = `
  const [topicOrder, setTopicOrder] = useState<string[]>([]);
  const [draggedTopic, setDraggedTopic] = useState<string | null>(null);

  useEffect(() => {
    const topics = Array.from(new Set(filteredKpis.map((k: any) => k.title)));
    setTopicOrder(topics);
  }, [filteredKpis]);

  const handleDragStart = (e: React.DragEvent, topic: string) => {
    setDraggedTopic(topic);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, topic: string) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetTopic: string) => {
    e.preventDefault();
    if (!draggedTopic || draggedTopic === targetTopic) {
      setDraggedTopic(null);
      return;
    }

    const newOrder = [...topicOrder];
    const draggedIdx = newOrder.indexOf(draggedTopic);
    const targetIdx = newOrder.indexOf(targetTopic);
    
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedTopic);
    
    setTopicOrder(newOrder);
    setDraggedTopic(null);

    let currentGlobalOrder = 0;
    const reorderedKpis: any[] = [];
    
    newOrder.forEach(topic => {
      const tKpis = kpis.filter(k => k.title === topic);
      tKpis.forEach(k => {
        reorderedKpis.push({ id: k.id, display_order: currentGlobalOrder++ });
      });
    });

    try {
      const token = localStorage.getItem('token');
      await axios.put(\`\${API_URL}/reorder\`, { kpis: reorderedKpis }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      fetchData();
    } catch (err: any) {
      alert('Failed to save new order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDragEnd = () => {
    setDraggedTopic(null);
  };
`;
if (code.match(handleMoveRegex)) {
  code = code.replace(handleMoveRegex, dragLogic);
} else {
  // if handleMove not found for some reason, insert before handleDeleteResults
  code = code.replace('const handleDeleteResults =', dragLogic + '\n  const handleDeleteResults =');
}

// 4. Update the Table structure for Matrix view
// Remove outer tbody
code = code.replace(/<\/thead>\s*<tbody>/g, '</thead>');
code = code.replace(/<td colSpan=\{17\} className="text-center py-4">ไม่มีข้อมูลภาระงาน<\/td><\/tr>/g, '<tbody><tr><td colSpan={17} className="text-center py-4">ไม่มีข้อมูลภาระงาน</td></tr></tbody>');

const oldMatrixMap = /\(Object\.entries\(groupedKpis\) as any\)\.map\(\(entry: any\) => \{\s*const \[mainTopic, topicKpis\] = entry;\s*return \(\s*<Fragment key=\{mainTopic\}>\s*<tr className="bg-indigo-50 border-b border-indigo-200">/g;

const newMatrixMap = `topicOrder.map((mainTopic: string) => {
                    const topicKpis = groupedKpis[mainTopic];
                    if (!topicKpis) return null;
                    return (
                    <tbody 
                      key={mainTopic}
                      draggable
                      onDragStart={(e) => handleDragStart(e, mainTopic)}
                      onDragOver={(e) => handleDragOver(e, mainTopic)}
                      onDrop={(e) => handleDrop(e, mainTopic)}
                      onDragEnd={handleDragEnd}
                      className={\`transition-opacity \${draggedTopic === mainTopic ? 'opacity-40' : 'opacity-100'}\`}
                    >
                      <tr className="bg-indigo-50 border-b border-indigo-200 cursor-move hover:bg-indigo-100 transition-colors" title="คลิกค้างแล้วลากเพื่อย้ายตำแหน่ง">
                        <td colSpan={17} className="px-3 py-3 font-bold text-indigo-900 text-[15px]">
                          <div className="flex items-center">
                            <GripVertical className="w-4 h-4 mr-1.5 text-indigo-400" />
                            หัวข้อหลัก: {mainTopic}
                          </div>
                        </td>
                      </tr>`;

code = code.replace(oldMatrixMap, newMatrixMap);

// Replace Fragment closing for Matrix view
const oldMatrixEnd = /<\/Fragment>\s*\)\}\)\s*\)\}\s*<\/tbody>\s*<\/table>/g;
code = code.replace(oldMatrixEnd, `</tbody>\n                    )\n                  })\n                )}\n            </table>`);


// 5. Update the Table structure for List view
code = code.replace(/<td colSpan=\{9\} className="text-center py-4">ไม่มีข้อมูลภาระงาน<\/td><\/tr>/g, '<tbody><tr><td colSpan={9} className="text-center py-4">ไม่มีข้อมูลภาระงาน</td></tr></tbody>');

const oldListMap = /\(Object\.entries\(groupedKpis\) as any\)\.map\(\(entry: any\) => \{\s*const \[mainTopic, topicKpis\] = entry;\s*return \(\s*<Fragment key=\{mainTopic\}>\s*<tr className="bg-indigo-50 border-b border-indigo-200">/g;

const newListMap = `topicOrder.map((mainTopic: string) => {
                    const topicKpis = groupedKpis[mainTopic];
                    if (!topicKpis) return null;
                    return (
                    <tbody 
                      key={mainTopic}
                      draggable
                      onDragStart={(e) => handleDragStart(e, mainTopic)}
                      onDragOver={(e) => handleDragOver(e, mainTopic)}
                      onDrop={(e) => handleDrop(e, mainTopic)}
                      onDragEnd={handleDragEnd}
                      className={\`transition-opacity \${draggedTopic === mainTopic ? 'opacity-40' : 'opacity-100'}\`}
                    >
                      <tr className="bg-indigo-50 border-b border-indigo-200 cursor-move hover:bg-indigo-100 transition-colors" title="คลิกค้างแล้วลากเพื่อย้ายตำแหน่ง">
                        <td colSpan={9} className="px-4 py-3 font-bold text-indigo-900 text-[15px]">
                          <div className="flex items-center">
                            <GripVertical className="w-5 h-5 mr-2 text-indigo-400" />
                            หัวข้อหลัก: {mainTopic}
                          </div>
                        </td>
                      </tr>`;

code = code.replace(oldListMap, newListMap);

// Replace Fragment closing for List view
const oldListEnd = /<\/Fragment>\s*\)\}\)\s*\)\}\s*<\/tbody>\s*<\/table>/g;
code = code.replace(oldListEnd, `</tbody>\n                    )\n                  })\n                )}\n            </table>`);


fs.writeFileSync('src/app/kpi/page.tsx', code, 'utf8');
console.log('Drag and Drop fully implemented!');
