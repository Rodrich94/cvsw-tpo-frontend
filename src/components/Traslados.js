import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, notification } from 'antd';
import { EyeOutlined,DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const Traslados = () => {
    const [traslados, setTraslados] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [establecimientos, setEstablecimientos] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedTraslado, setSelectedTraslado] = useState(null);
    const [form] = Form.useForm();

    const fetchTraslados = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/traslados');
            setTraslados(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los traslados.',
            });
        }
    };

    const fetchEstablecimientos = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/establecimientos');
            setEstablecimientos(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los establecimientos.',
            });
        }
    };

    const fetchServiciosPorEstablecimiento = async (establecimientoId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000//servicios/establecimiento/${establecimientoId}`);
            setServicios(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los servicios.',
            });
        }
    };

    const fetchEmpleadosPorServicio = async (servicioId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/servicios/${servicioId}/empleados`);
            setEmpleados(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los empleados.',
            });
        }
    };

    useEffect(() => {
        fetchTraslados();
        fetchEstablecimientos();
    }, []);

    const handleAdd = async (values) => {
        try {
            await axios.post('http://127.0.0.1:5000/traslado', {
                origen: values.origen,
                destino: values.destino,
                tramo: values.tramo,
                fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
                fecha_fin: values.fecha_fin.format('YYYY-MM-DD'),
                empleado_id: values.empleado_id,
                servicio_id: values.servicio_id,
            });
            fetchTraslados();
            setIsModalVisible(false);
            form.resetFields();
            notification.success({
                message: 'Traslado creado',
                description: 'El traslado se ha creado exitosamente.',
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al crear el traslado.',
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/traslado/${id}`);
            fetchTraslados();
            notification.success({
                message: 'Traslado eliminado',
                description: `El traslado con ID ${id} se ha eliminado exitosamente.`,
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al eliminar el traslado.',
            });
        }
    };

    const handleView = async (id) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/traslado/${id}`);
            setSelectedTraslado(response.data);
            setIsDetailModalVisible(true);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los detalles del traslado.',
            });
        }
    };

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

    const columns = [
        {
            title: 'Empleado',
            key: 'empleado_id',
            render: (_, record) => (
                `${record.actividad.nombre_empleado} ${record.actividad.apellido_empleado}`
            )
        },
        {
            title: 'Origen',
            dataIndex: 'origen',
            key: 'origen',
        },
        {
            title: 'Destino',
            dataIndex: 'destino',
            key: 'destino',
        },
        {
            title: 'Tramo',
            dataIndex: 'tramo',
            key: 'tramo',
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <>
                    <Button type="primary" onClick={() => handleView(record.id)}>
                        <EyeOutlined />Ver
                    </Button>
                    <Button type="" onClick={() => handleDelete(record.id)} style={{ marginLeft: '8px', color:'red' }}>
                        <DeleteOutlined />
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.overlay}>
                <Button type="primary" style={{ margin: '10px 10px 10px 0px' }} onClick={() => setIsModalVisible(true)}>
                    Agregar Traslado
                </Button>
                <Table dataSource={traslados} columns={columns} rowKey="id" />
            </div>    

            <Modal
                title="Agregar Traslado"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleAdd}>
                    <Form.Item name="origen" label="Origen" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="destino" label="Destino" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="tramo" label="Tramo" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un tramo">
                            <Option value={'1'}>Tramo 1: hasta 100 km</Option>
                            <Option value={'2'}>Tramo 2: de 100 a 300 km</Option>
                            <Option value={'3'}>Tramo 3: más de 300 km</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="fecha_inicio" label="Fecha Inicio" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="fecha_fin" label="Fecha Fin" rules={[{ required: true }]}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="establecimiento_id" label="Establecimiento" rules={[{ required: true }]}>
                        <Select
                            placeholder="Selecciona un establecimiento"
                            onChange={(value) => fetchServiciosPorEstablecimiento(value)}
                        >
                            {establecimientos.map((establecimiento) => (
                                <Option key={establecimiento.id} value={establecimiento.id}>
                                    {establecimiento.nombre}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="servicio_id" label="Servicio" rules={[{ required: true }]}>
                        <Select
                            placeholder="Selecciona un servicio"
                            onChange={(value) => fetchEmpleadosPorServicio(value)}
                        >
                            {servicios.map((servicio) => (
                                <Option key={servicio.id} value={servicio.id}>
                                    {servicio.nombre}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="empleado_id" label="Empleado" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un empleado">
                            {empleados.map((empleado) => (
                                <Option key={empleado.legajo} value={empleado.legajo}>
                                    {empleado.nombre} {empleado.apellido}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Guardar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Detalles del Traslado"
                visible={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
            >
                {selectedTraslado && (
                    <div>
                        <p><strong>Origen:</strong> {selectedTraslado.origen}</p>
                        <p><strong>Destino:</strong> {selectedTraslado.destino}</p>
                        <p><strong>Tramo:</strong> {selectedTraslado.tramo}</p>
                        <p><strong>Fecha Inicio:</strong> {moment(selectedTraslado.fecha_inicio).format('YYYY-MM-DD')}</p>
                        <p><strong>Fecha Fin:</strong> {moment(selectedTraslado.fecha_fin).format('YYYY-MM-DD')}</p>
                        <p><strong>Empleado:</strong> {selectedTraslado.actividad.nombre_empleado} {selectedTraslado.actividad.apellido_empleado}</p>
                        <p><strong>Establecimiento:</strong> {selectedTraslado.actividad.establecimiento}</p>
                        <p><strong>Servicio:</strong> {selectedTraslado.actividad.servicio_id}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Traslados;
