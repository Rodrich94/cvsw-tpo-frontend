import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Modal, Form, DatePicker, notification, Spin } from 'antd';
import { EyeOutlined,DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
const { Option } = Select;

const Diagramas = () => {
    const [diagramas, setDiagramas] = useState([]);
    const [establecimientos, setEstablecimientos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [selectedEstablecimiento, setSelectedEstablecimiento] = useState(null);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [selectedMes, setSelectedMes] = useState(null);
    const [selectedAnio, setSelectedAnio] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Estado de carga
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchAllDiagramas = async () => {
        setLoading(true); // Activar el spinner de carga
        try {
            const response = await axios.get('http://127.0.0.1:5000/diagramas');
            setDiagramas(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los diagramas.',
            });
        } finally {
            setLoading(false); // Desactivar el spinner después de la carga
        }
    };

    const fetchFilteredDiagramas = async () => {
        setLoading(true); // Activar el spinner de carga
        try {
            const params = {};
            if (selectedServicio) params.servicio_id = selectedServicio;
            if (selectedMes) params.mes = selectedMes;
            if (selectedAnio) params.anio = selectedAnio;

            const response = await axios.get('http://127.0.0.1:5000/diagramas/filtrados', { params });
            setDiagramas(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los diagramas filtrados.',
            });
        } finally {
            setLoading(false); // Desactivar el spinner después de la carga
        }
    };

    const fetchEstablecimientos = async () => {
        setLoading(true); // Activar el spinner de carga
        try {
            const response = await axios.get('http://127.0.0.1:5000/establecimientos');
            setEstablecimientos(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los establecimientos.',
            });
        } finally {
            setLoading(false); // Desactivar el spinner después de la carga
        }
    };

    const fetchServiciosByEstablecimiento = async (establecimientoId) => {
        setLoading(true); // Activar el spinner de carga
        try {
            const response = await axios.get(`http://127.0.0.1:5000/establecimientos/${establecimientoId}/servicios`);
            setServicios(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los servicios para el establecimiento.',
            });
        } finally {
            setLoading(false); // Desactivar el spinner después de la carga
        }
    };

    useEffect(() => {
        fetchEstablecimientos();
        fetchAllDiagramas();
    }, []);

    const handleEstablecimientoChange = (value) => {
        setSelectedEstablecimiento(value);
        setSelectedServicio(null); // Reset servicio when establecimiento changes
        fetchServiciosByEstablecimiento(value); // Fetch services based on the selected establecimiento
    };

    const handleServicioChange = (value) => {
        setSelectedServicio(value);
    };

    const handleMesChange = (date) => {
        setSelectedMes(date ? date.month() + 1 : null); // Los meses empiezan en 0, así que sumamos 1
    };

    const handleAnioChange = (date) => {
        setSelectedAnio(date ? date.year() : null);
    };

    const handleApplyFilters = () => {
        fetchFilteredDiagramas();
    };

    const handleClearFilters = () => {
        setSelectedEstablecimiento(null);
        setSelectedServicio(null);
        setSelectedMes(null);
        setSelectedAnio(null);
        setServicios([]);
        fetchAllDiagramas();
    };

    const handleAdd = async (values) => {
        setLoading(true); // Activar el spinner de carga
        try {
            const anio = values.anio.year();
            const mes = values.mes.month() + 1;

            await axios.post('http://127.0.0.1:5000/diagrama', {                
                anio,
                mes,
                servicio_id: values.servicio_id,
            });

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
        } finally {
            setLoading(false); // Desactivar el spinner después de la carga
        }
    };

    const handleDelete = async (id) => {
        setLoading(true); // Activar el spinner de carga
        try {
            await axios.delete(`http://127.0.0.1:5000/diagrama/${id}`);
            fetchAllDiagramas();
            notification.success({
                message: 'Diagrama eliminado',
                description: `El Diagrama con ID ${id} se ha eliminado exitosamente.`,
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al eliminar el Diagrama.',
            });
        } finally {
            setLoading(false); // Desactivar el spinner después de la carga
        }
    };

    const handleView = (id) => {
        navigate(`/diagrama/${id}`);
    };

    const columns = [
        { title: 'Fecha Inicio', dataIndex: 'fecha_ini', key: 'fecha_ini' },
        { title: 'Fecha Fin', dataIndex: 'fecha_fin', key: 'fecha_fin' },
        { title: 'Servicio', dataIndex: 'servicio', key: 'servicio' },
        { title: 'Establecimiento', dataIndex: 'establecimiento', key: 'establecimiento' },
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
                    <Button type="primary" onClick={() => handleView(record.id)}><EyeOutlined />Ver</Button>
                    <Button type="" onClick={() => handleDelete(record.id)} style={{ marginLeft: '8px', color: 'red' }}><DeleteOutlined /></Button>
                </>
            ),
        },
    ];

    const styles = {
        container: {
            position: 'relative',
            padding: '20px',
            height: '82vh',
            backgroundImage: 'url("/fondo-salud.jpg")',
            backgroundSize: 'cover',
            color: '#fff',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 1,
            padding: '25px',
        },
        content: {
            position: 'relative',
            zIndex: 2,
        },
    };

    return (
        <div style={styles.container}>
            {/* Mostrar el spinner mientras loading es verdadero */}
            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: '0 auto', marginTop: '20px' }} />
            ) : (
                <div style={styles.overlay}>
                    <Button
                        type="primary"
                        onClick={() => setIsModalVisible(true)}
                        style={{ marginRight: '20px', padding:'20px'}}
                    >
                        Crear Diagrama
                    </Button>

                    <Select
                        placeholder="Seleccionar Establecimiento"
                        style={{ width: 200, margin: '15px 15px 15px 0px', minHeight: '40px' }}
                        onChange={handleEstablecimientoChange}
                        value={selectedEstablecimiento}
                        allowClear
                    >
                        {establecimientos.map((establecimiento) => (
                            <Option key={establecimiento.id} value={establecimiento.id}>
                                {establecimiento.nombre}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Seleccionar Servicio"
                        style={{ width: 200, margin: '15px' }}
                        onChange={handleServicioChange}
                        value={selectedServicio}
                        disabled={!selectedEstablecimiento}
                        allowClear
                    >
                        {servicios.map((servicio) => (
                            <Option key={servicio.id} value={servicio.id}>
                                {servicio.nombre}
                            </Option>
                        ))}
                    </Select>

                    <DatePicker
                        picker="month"
                        placeholder="Selecciona Mes"
                        style={{ margin: '15px' }}
                        onChange={handleMesChange}
                        value={selectedMes ? moment().month(selectedMes - 1) : null}
                    />

                    <DatePicker
                        picker="year"
                        placeholder="Selecciona Año"
                        style={{ margin: '15px' }}
                        onChange={handleAnioChange}
                        value={selectedAnio ? moment().year(selectedAnio) : null}
                    />

                    <Button type="primary" onClick={handleApplyFilters} style={{ margin: '15px', backgroundColor:'green'}}>
                        Filtrar
                    </Button>

                    <Button onClick={handleClearFilters} style={{ margin: '15px' }}>
                        Limpiar Filtros
                    </Button>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={diagramas}
                        pagination={{ pageSize: 10 }}
                    />

                    <Modal
                        title="Crear Diagrama"
                        visible={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer={null}
                    >
                        <Form
                            form={form}
                            onFinish={handleAdd}
                            layout="vertical"
                        >
                            <Form.Item
                                name="establecimiento_id"
                                label="Establecimiento"
                                initialValue={selectedEstablecimiento}
                                rules={[{ required: true, message: 'Selecciona un establecimiento' }]}
                            >
                                <Select
                                    placeholder="Seleccionar Establecimiento"
                                    onChange={handleEstablecimientoChange}
                                    value={selectedEstablecimiento}
                                    allowClear
                                >
                                    {establecimientos.map((establecimiento) => (
                                        <Option key={establecimiento.id} value={establecimiento.id}>
                                            {establecimiento.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="servicio_id"
                                label="Servicio"
                                rules={[{ required: true, message: 'Selecciona un servicio' }]}
                            >
                                <Select
                                    placeholder="Seleccionar Servicio"
                                    onChange={handleServicioChange}
                                    value={selectedServicio}
                                    disabled={!selectedEstablecimiento}
                                    allowClear
                                >
                                    {servicios.map((servicio) => (
                                        <Option key={servicio.id} value={servicio.id}>
                                            {servicio.nombre}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="mes"
                                label="Mes"
                                rules={[{ required: true, message: 'Selecciona un mes' }]}
                            >
                                <DatePicker
                                    picker="month"
                                    placeholder="Selecciona Mes"
                                    style={{ width: '100%' }}
                                    onChange={handleMesChange}
                                    value={selectedMes ? moment().month(selectedMes - 1) : null}
                                />
                            </Form.Item>

                            <Form.Item
                                name="anio"
                                label="Año"
                                rules={[{ required: true, message: 'Selecciona un año' }]}
                            >
                                <DatePicker
                                    picker="year"
                                    placeholder="Selecciona Año"
                                    style={{ width: '100%' }}
                                    onChange={handleAnioChange}
                                    value={selectedAnio ? moment().year(selectedAnio) : null}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">Crear</Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            )}
        </div>
    );
};

export default Diagramas;


