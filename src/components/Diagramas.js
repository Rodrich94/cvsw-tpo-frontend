import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Modal, Form, DatePicker, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

const Diagramas = () => {
    const [diagramas, setDiagramas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
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


            if (fechaInicio) {
                params.fecha_ini = fechaInicio.format('YYYY-MM-DD'); 
            }

            if (fechaFin) {
                params.fecha_fin = fechaFin.format('YYYY-MM-DD'); 
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
        if (selectedServicio || fechaInicio || fechaFin) {
            fetchFilteredDiagramas(); // Obtén diagramas filtrados si hay algún filtro aplicado
        } else {
            fetchAllDiagramas(); // Si no hay filtros, obtén todos los diagramas
        }
    }, [selectedServicio, fechaInicio, fechaFin]);

    const handleServicioChange = (value) => {
        setSelectedServicio(value); // Actualiza el estado con el servicio seleccionado
    };


    const handleFechaInicioChange = (date) => {
        setFechaInicio(date); // Actualiza el estado con la fecha de inicio seleccionada
    };

    const handleFechaFinChange = (date) => {
        setFechaFin(date); // Actualiza el estado con la fecha de fin seleccionada
    };

    const handleAdd = async (values) => {
        try {
            // Extraer año y mes del picker y convertirlos a números
            const anio = values.anio.year();
            const mes = values.mes.month() + 1; // Los meses en DatePicker empiezan en 0, así que sumamos 1
    
            await axios.post('http://127.0.0.1:5000/diagrama', {
                anio: anio,
                mes: mes,
                servicio_id: values.servicio_id,
            });
    
            // Vuelve a obtener todos los diagramas después de agregar uno nuevo
            fetchAllDiagramas();
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

    const styles = {
        container: {
            position: 'relative',
            padding: '20px',
            height: '82vh',
            backgroundImage: 'url("/fondo-salud.jpg")', // Ruta de la imagen de fondo
            backgroundSize: 'cover',
            color: '#fff',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Color y opacidad del overlay
            zIndex: 1,
            padding: '25px',
        },
        content: {
            position: 'relative',
            zIndex: 2, 
        },
    };

    const columns = [
        { title: 'Fecha Inicio', dataIndex: 'fecha_ini', key: 'fecha_ini' },
        { title: 'Fecha Fin', dataIndex: 'fecha_fin', key: 'fecha_fin' },
        { title: 'Servicio', dataIndex: 'servicio', key: 'servicio' },
        { 
            title: 'Tipo actividad', 
            key: 'tipo_actividad',
            render: (_, record) => (
                record.actividades_extraordinarias.length > 0 
                    ? record.actividades_extraordinarias[0].tipo_actividad 
                    : 'N/A'
            )
        },
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
        <div style={styles.container}>
            <div style={styles.overlay}>
                {/* Filtro por Servicio */}
                <Select
                    placeholder="Filtrar por Servicio"
                    style={{ width: 200, margin: '15px 15px 15px 0px', padding: '0px', minHeight: '40px' }}
                    onChange={handleServicioChange}
                    allowClear
                >
                    {servicios.map((servicio) => (
                        <Option key={servicio.id} value={servicio.id}>
                            {servicio.establecimiento} - {servicio.nombre}
                        </Option>
                    ))}
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
                    setFechaInicio(null);
                    setFechaFin(null);
                }} style={{ margin: '15px', minHeight: '40px' }}>
                    Borrar Filtros
                </Button>
                <Button type="primary" style={{ margin: '15px', minHeight: '40px' }} onClick={() => setIsModalVisible(true)}>Crear Diagrama</Button>
                <Table dataSource={diagramas} columns={columns} rowKey="id" />
            </div>    
            <Modal
                title="Agregar Diagrama"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleAdd}>
                    {/* Campo para seleccionar el año */}
                    <Form.Item name="anio" label="Año" rules={[{ required: true }]}>
                        <DatePicker picker="year" placeholder="Selecciona el año" />
                    </Form.Item>

                    {/* Campo para seleccionar el mes */}
                    <Form.Item name="mes" label="Mes" rules={[{ required: true }]}>
                        <DatePicker picker="month" placeholder="Selecciona el mes" />
                    </Form.Item>

                    {/* Campo para seleccionar el servicio */}
                    <Form.Item name="servicio_id" label="ID Servicio" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un servicio">
                            {servicios.map((servicio) => (
                                <Option key={servicio.id} value={servicio.id}>{servicio.establecimiento} - {servicio.nombre}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Botón de guardar */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Guardar</Button>
                    </Form.Item>
                </Form>
            </Modal>
    
        </div>
    );
};

export default Diagramas;
