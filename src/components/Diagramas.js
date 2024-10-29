import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Modal, Form, DatePicker, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

const Diagramas = () => {
    const [diagramas, setDiagramas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchAllDiagramas = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/diagramas');
            setDiagramas(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los diagramas.',
            });
        }
    };

    const fetchFilteredDiagramas = async () => {
        try {
            const params = {};
            
            if (selectedServicio) {
                params.servicio_id = selectedServicio;
            }

            if (selectedEstado) { // Cambiado de setSelectedEstado a selectedEstado
                params.estado = selectedEstado;
            }

            if (fechaInicio) {
                params.fecha_inicio = fechaInicio.format('YYYY-MM-DD'); // Si utilizas un objeto moment
            }

            if (fechaFin) {
                params.fecha_fin = fechaFin.format('YYYY-MM-DD'); // Si utilizas un objeto moment
            }

            const response = await axios.get('http://127.0.0.1:5000/diagramas/filtrados', {
                params: params,
            });
            
            setDiagramas(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los diagramas filtrados.',
            });
        }
    };

    const fetchServicios = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/servicios');
            setServicios(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los servicios.',
            });
        }
    };

    useEffect(() => {
        fetchServicios(); // Obtén servicios solo una vez
        fetchAllDiagramas(); // Obtén todos los diagramas al cargar el componente
    }, []);

    useEffect(() => {
        if (selectedServicio || selectedEstado || fechaInicio || fechaFin) {
            fetchFilteredDiagramas(); // Obtén diagramas filtrados si hay algún filtro aplicado
        } else {
            fetchAllDiagramas(); // Si no hay filtros, obtén todos los diagramas
        }
    }, [selectedServicio, selectedEstado, fechaInicio, fechaFin]);

    const handleServicioChange = (value) => {
        setSelectedServicio(value); // Actualiza el estado con el servicio seleccionado
    };

    const handleEstadoChange = (value) => {
        setSelectedEstado(value); // Actualiza el estado con el estado seleccionado
    };

    const handleFechaInicioChange = (date) => {
        setFechaInicio(date); // Actualiza el estado con la fecha de inicio seleccionada
    };

    const handleFechaFinChange = (date) => {
        setFechaFin(date); // Actualiza el estado con la fecha de fin seleccionada
    };

    const handleAdd = async (values) => {
        try {
            await axios.post('http://127.0.0.1:5000/diagrama', {
                estado: values.estado,
                fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
                fecha_fin: values.fecha_fin.format('YYYY-MM-DD'),
                servicio_id: values.servicio_id,
            });
            fetchAllDiagramas(); // Vuelve a obtener todos los diagramas después de agregar uno nuevo
            setIsModalVisible(false);
            form.resetFields();
            notification.success({
                message: 'Diagrama creado',
                description: 'El diagrama se ha creado exitosamente.',
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al crear el diagrama.',
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/diagrama/${id}`);
            fetchAllDiagramas(); // Vuelve a obtener todos los diagramas después de eliminar uno
            notification.success({
                message: 'Diagrama eliminado',
                description: `El Diagrama con ID ${id} se ha eliminado exitosamente.`,
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al eliminar el Diagrama.',
            });
        }
    };

    const handleView = (id) => {
        navigate(`/diagrama/${id}`);
    };

    const columns = [
        { title: 'Fecha Inicio', dataIndex: 'fecha_ini', key: 'fecha_ini' },
        { title: 'Fecha Fin', dataIndex: 'fecha_fin', key: 'fecha_fin' },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },
        { title: 'Servicio', dataIndex: 'servicio', key: 'servicio' },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <>
                    <Button type="primary" onClick={() => handleView(record.id)}>Ver</Button>
                    <Button type="danger" onClick={() => handleDelete(record.id)} style={{ marginLeft: '8px' }}>Eliminar</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            {/* Filtro por Servicio */}
            <Select
                placeholder="Filtrar por Servicio"
                style={{ width: 200, margin: '15px', padding: '0px', minHeight: '40px' }}
                onChange={handleServicioChange}
                allowClear
            >
                {servicios.map((servicio) => (
                    <Option key={servicio.id} value={servicio.id}>
                        {servicio.establecimiento} - {servicio.nombre}
                    </Option>
                ))}
            </Select>

            {/* Filtro por Estado */}
            <Select
                placeholder="Filtrar por Estado"
                style={{ width: 200, margin: '15px', padding: '0px', minHeight: '40px' }}
                onChange={handleEstadoChange}
                allowClear
            >
                <Option value="Pendiente">Pendiente</Option>
                <Option value="Aprobado">Aprobado</Option>
            </Select>

            {/* Filtro por Fecha Inicio */}
            <DatePicker 
                placeholder="Mayor a:"
                style={{ margin: '15px', minHeight: '40px' }} 
                onChange={handleFechaInicioChange}
            />

            {/* Filtro por Fecha Fin */}
            <DatePicker 
                placeholder="Menor a:"
                style={{ margin: '15px', minHeight: '40px' }} 
                onChange={handleFechaFinChange}
            />

            {/* Botón para borrar filtros */}
            <Button type="default" onClick={() => {
                setSelectedServicio(null);
                setSelectedEstado(null);
                setFechaInicio(null);
                setFechaFin(null);
            }} style={{ margin: '15px', minHeight: '40px' }}>
                Borrar Filtros
            </Button>
            <Button type="primary" style={{ margin: '15px', minHeight: '40px' }} onClick={() => setIsModalVisible(true)}>Crear Diagrama</Button>
            <Table dataSource={diagramas} columns={columns} rowKey="id" />

            <Modal
                title="Agregar Diagrama"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleAdd}>
                    <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un Estado">
                            <Option value="Pendiente">Pendiente</Option>
                            <Option value="Aprobado">Aprobado</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="fecha_inicio" label="Fecha Inicio" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="fecha_fin" label="Fecha Fin" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="servicio_id" label="ID Servicio" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un servicio">
                            {servicios.map((servicio) => (
                                <Option key={servicio.id} value={servicio.id}>{servicio.establecimiento} - {servicio.nombre}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Guardar</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Diagramas;