const fs = require('fs');

let code = fs.readFileSync('src/app/kpi/page.tsx', 'utf8');

// 1. Remove ArrowUp, ArrowDown from Manage Column
code = code.replace(
  /\{\/\* Move Up\/Down \*\/\}[\s\S]*?<\/div>/g, 
  ''
);

// 2. Remove ArrowUp, ArrowDown from imports, Add GripVertical
code = code.replace(
  "import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2, History, Eraser, ArrowUp, ArrowDown } from 'lucide-react';",
  "import { Target, TrendingUp, AlertTriangle, X, Plus, Edit2, Trash2, History, Eraser, GripVertical } from 'lucide-react';"
);

// 3. Replace handleMove with Drag & Drop Logic
const handleMoveRegex = /const handleMove = async \([\s\S]*?catch \(err: any\) \{[\s\S]*?\}[\s\S]*?\};/;
const dragLogic = `
  const [topicOrder, setTopicOrder] = useState<string[]>([]);
  const [draggedTopic, setDraggedTopic] = useState<string | null>(null);

  useEffect(() => {
    // Extract unique topics in their current order
    const topics = Array.from(new Set(filteredKpis.map((k: any) => k.title)));
    setTopicOrder(topics);
  }, [filteredKpis]);

  const handleDragStart = (e: React.DragEvent, topic: string) => {
    setDraggedTopic(topic);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, topic: string) => {
    e.preventDefault(); // Necessary to allow dropping
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

    // Update display_order for all KPIs based on new topic order
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
      // Optionally fetch data again or let the UI optimistically render
      fetchData();
    } catch (err: any) {
      alert('Failed to save new order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDragEnd = () => {
    setDraggedTopic(null);
  };
`;
code = code.replace(handleMoveRegex, dragLogic);

// 4. Update Matrix View JSX for Drag & Drop
const matrixMapRegex = /\(Object\.entries\(groupedKpis\) as any\)\.map\(\(entry: any\) => \{\s*const \[mainTopic, topicKpis\] = entry;\s*return \(\s*<Fragment key=\{mainTopic\}>\s*<tr className="bg-indigo-50 border-b border-indigo-200">/g;

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
                      className={\`transition-opacity \${draggedTopic === mainTopic ? 'opacity-30' : 'opacity-100'}\`}
                    >
                      <tr className="bg-indigo-50 border-b border-indigo-200 cursor-move hover:bg-indigo-100 transition-colors">
                        <td colSpan={17} className="px-3 py-3 font-bold text-indigo-900 text-[15px]">
                          <div className="flex items-center">
                            <GripVertical className="w-4 h-4 mr-1.5 text-indigo-400" />
                            หัวข้อหลัก: {mainTopic}
                          </div>
                        </td>
                      </tr>`;

code = code.replace(matrixMapRegex, newMatrixMap);

// Wait, the Matrix view uses <tbody> encompassing the whole table. We need to close the custom <tbody> instead of </Fragment>
// Let's replace </Fragment> for Matrix view
// Actually, in Matrix view, there is a single <tbody> wrapped around the whole map. We need to remove the outer <tbody>!
// Let's check how the matrix table is structured first.

fs.writeFileSync('src/app/kpi/page.tsx.temp', code, 'utf8');
console.log('Done part 1');
