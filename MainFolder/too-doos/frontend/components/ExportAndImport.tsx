'use client';

import React from 'react';

interface Task {
  id?: string;
  title: string;
  description: string;
  due_to: string;
  status: string;
  priority: boolean;
}

interface ExportImportTasksProps {
  tasks: Task[];
}

export default function ExportImportTasks({ tasks }: ExportImportTasksProps) {
  const prepareDataForExport = () => {
    return tasks.map(task => ({
      title: task.title,
      description: task.description,
      due_to: task.due_to,
      status: task.status,
      priority: task.priority,
    }));
  };

  const exportToJSON = () => {
    const data = prepareDataForExport();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const data = prepareDataForExport();
    const header = ['title', 'description', 'due_to', 'status', 'priority'];
    const rows = data.map(task =>
      [
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.due_to,
        task.status,
        task.priority,
      ].join(',')
    );
    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToXML = () => {
    const data = prepareDataForExport();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tasks>\n';
    data.forEach(task => {
      xml += `  <task>\n`;
      xml += `    <title>${task.title}</title>\n`;
      xml += `    <description>${task.description}</description>\n`;
      xml += `    <due_to>${task.due_to}</due_to>\n`;
      xml += `    <status>${task.status}</status>\n`;
      xml += `    <priority>${task.priority}</priority>\n`;
      xml += `  </task>\n`;
    });
    xml += '</tasks>';
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importTasks = async (importedTasks: Task[]) => {
    try {
      const responses = await Promise.all(
        importedTasks.map(task =>
          fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              due_to: task.due_to,
              status: task.status,
              priority: task.priority,
            }),
          })
        )
      );
      const results = await Promise.all(responses.map(res => res.json()));
      alert('Import successful');
      console.log('Imported tasks:', results);
    } catch (err: any) {
      alert('Import Error: ' + err.message);
      console.error(err);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
        try {
          let importedTasks: Task[] = [];
          if (fileType === 'application/json' || file.name.endsWith('.json')) {
            importedTasks = JSON.parse(text);
          } else if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
            importedTasks = parseCSV(text);
          } else if (fileType === 'application/xml' || file.name.endsWith('.xml')) {
            importedTasks = parseXML(text);
          } else {
            throw new Error('Unsupported file type');
          }
          importTasks(importedTasks);
        } catch (err: any) {
          alert('Import Error: ' + err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): Task[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    const header = lines[0].split(',');
    const tasks: Task[] = lines.slice(1).map(line => {
      const values = line.split(',');
      const task: any = {};
      header.forEach((key, index) => {
        task[key.trim()] = values[index]?.trim();
      });
      task.priority = task.priority === 'true';
      return task;
    });
    return tasks;
  };

  const parseXML = (xmlText: string): Task[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const taskElements = xmlDoc.getElementsByTagName('task');
    const tasks: Task[] = [];
    for (let i = 0; i < taskElements.length; i++) {
      const taskElem = taskElements[i];
      const getText = (tag: string) =>
        taskElem.getElementsByTagName(tag)[0]?.textContent || '';
      const task: Task = {
        title: getText('title'),
        description: getText('description'),
        due_to: getText('due_to'),
        status: getText('status'),
        priority: getText('priority') === 'true',
        id: '',
      };
      tasks.push(task);
    }
    return tasks;
  };

  return (
    <div className='content'>
      <div>
        <h2>Export Tasks</h2>
        <div className='box3'>
          <button onClick={exportToCSV}>
            Export CSV
          </button>
          <button onClick={exportToXML}>
            Export XML
          </button>
          <button onClick={exportToJSON}>
            Export JSON
          </button>
        </div>
        <h2>Import Tasks</h2>
        <input type="file" accept=".csv,.xml,.json" onChange={handleFileImport}/>
      </div>
    </div>
  );
}
