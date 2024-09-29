'use client'

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
  Connection,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Moon, Sun, Star, Home, Github, Database, Cog, FileInput, Binary, Printer } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const nodeTypes = {
  input: { label: 'Input', color: '#FF6B6B', icon: FileInput },
  logic: { label: 'Logic', color: '#4ECDC4', icon: Binary },
  output: { label: 'Output', color: '#45B7D1', icon: Printer },
  utility: { label: 'Utility', color: '#FFA07A', icon: Cog },
}

const fhirResources = [
  { value: 'Patient', label: 'Patient', color: '#4CAF50' },
  { value: 'Observation', label: 'Observation', color: '#2196F3' },
  { value: 'Condition', label: 'Condition', color: '#FFC107' },
  { value: 'MedicationRequest', label: 'Medication Request', color: '#9C27B0' },
]

const outputFormats = ['Text', 'Table', 'Chart', 'Notification']

const CustomNode = ({ id, data, isConnectable }) => {
  const handleChange = (field, value) => {
    console.log(`Node ${id} field ${field} changed to:`, value)
    // Here you would update the node data in your state management system
    // For example: updateNodeData(id, { [field]: value });
  }

  const renderFields = () => {
    switch (data.type) {
      case 'input':
        return (
          <>
            <Select onValueChange={(value) => handleChange('triggerType', value)}>
              <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onLaunch">On App Launch</SelectItem>
                <SelectItem value="buttonClick">Button Click</SelectItem>
                <SelectItem value="scheduled">Scheduled Interval</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Patient ID" 
              className="bg-gray-700 text-white border-gray-600 mt-2" 
              onChange={(e) => handleChange('patientId', e.target.value)}
            />
            <Input 
              type="date" 
              placeholder="Start Date" 
              className="bg-gray-700 text-white border-gray-600 mt-2" 
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
            <Input 
              type="date" 
              placeholder="End Date" 
              className="bg-gray-700 text-white border-gray-600 mt-2" 
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
          </>
        )
      case 'logic':
        return (
          <>
            <textarea
              className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
              placeholder="Enter conditional logic"
              onChange={(e) => handleChange('logic', e.target.value)}
            />
            <Input 
              placeholder="Data Transformation" 
              className="bg-gray-700 text-white border-gray-600 mt-2" 
              onChange={(e) => handleChange('transformation', e.target.value)}
            />
          </>
        )
      case 'output':
        return (
          <>
            <Select onValueChange={(value) => handleChange('outputFormat', value)}>
              <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                <SelectValue placeholder="Select Output Format" />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="Visualization Settings" 
              className="bg-gray-700 text-white border-gray-600 mt-2" 
              onChange={(e) => handleChange('visualizationSettings', e.target.value)}
            />
          </>
        )
      case 'utility':
        return (
          <>
            <Select onValueChange={(value) => handleChange('utilityFunction', value)}>
              <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                <SelectValue placeholder="Select Utility Function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateCalc">Date Calculation</SelectItem>
                <SelectItem value="unitConv">Unit Conversion</SelectItem>
                <SelectItem value="dataFormat">Data Formatting</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Function Parameters" 
              className="bg-gray-700 text-white border-gray-600 mt-2" 
              onChange={(e) => handleChange('functionParameters', e.target.value)}
            />
          </>
        )
      default:
        return (
          <>
            <Input 
              placeholder="Resource ID" 
              className="bg-gray-700 text-white border-gray-600" 
              onChange={(e) => handleChange('resourceId', e.target.value)}
            />
            <Select onValueChange={(value) => handleChange('operation', value)}>
              <SelectTrigger className="bg-gray-700 text-white border-gray-600 mt-2">
                <SelectValue placeholder="Select Operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>
          </>
        )
    }
  }

  return (
    <div 
      className="bg-gray-800 text-white shadow-md rounded-md p-3 min-w-[200px] border-4"
      style={{ borderColor: data.color }}
    >
      <div className="font-bold mb-2">{data.label}</div>
      {renderFields()}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#00FFFF', width: '20px', height: '20px', left: '-12px' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#00FFFF', width: '20px', height: '20px', right: '-12px' }}
        isConnectable={isConnectable}
      />
    </div>
  )
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [appType, setAppType] = useState('patient')
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const resourceData = fhirResources.find(r => r.value === type)
      const nodeTypeData = nodeTypes[type]

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type: 'custom',
        position,
        data: { 
          label: resourceData ? resourceData.label : nodeTypeData ? nodeTypeData.label : type,
          type: type,
          color: resourceData ? resourceData.color : nodeTypeData ? nodeTypeData.color : '#000000',
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, nodes, setNodes]
  )

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className={`bg-background text-foreground transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {sidebarOpen && <Input placeholder="Search" className="w-40" />}
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          {sidebarOpen ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Label htmlFor="app-type">App Type:</Label>
                <Select value={appType} onValueChange={setAppType}>
                  <SelectTrigger id="app-type">
                    <SelectValue placeholder="Select app type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="node-types">
                  <AccordionTrigger>Node Types</AccordionTrigger>
                  <AccordionContent>
                    {Object.entries(nodeTypes).map(([key, value]) => (
                      <div
                        key={key}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', key)}
                        className="mb-2 p-2 bg-secondary rounded-md cursor-move flex items-center"
                        style={{ borderLeft: `4px solid ${value.color}` }}
                      >
                        <value.icon className="h-4 w-4 mr-2" />
                        {value.label}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="fhir-resources">
                  <AccordionTrigger>FHIR Resources</AccordionTrigger>
                  <AccordionContent>
                    {fhirResources.map((resource) => (
                      <div
                        key={resource.value}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', resource.value)}
                        className="mb-2 p-2 bg-secondary rounded-md cursor-move flex items-center"
                        style={{ borderLeft: `4px solid ${resource.color}` }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {resource.label}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 mt-4">
              {Object.values(nodeTypes).map((value, index) => (
                <Button key={index} variant="ghost" size="icon" title={value.label}>
                  <value.icon className="h-4 w-4" />
                </Button>
              ))}
              <Button variant="ghost" size="icon" title="FHIR Resources">
                <Database className="h-4 w-4" />
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-background border-b">
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            FHIR-Arena
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              <Moon className="h-4 w-4" />
            </div>
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={{ custom: CustomNode }}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export function SmartOnFhirBuilder() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}