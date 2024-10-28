import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, notification } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const Traslados = () => {
    const [traslados, setTraslados] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedTraslado, setSelectedTraslado] = useState(null); // Para el traslado seleccionado
    const [form] = Form.useForm();

    // Función para obtener traslados de la API
    const fetchTraslados = async () => {
        const response = await axios.get('http://127.0.0.1:5000/traslados');
        setTraslados(response.data);
    };

    // Función para obtener empleados de la API
    const fetchEmpleados = async () => {
        const response = await axios.get('http://127.0.0.1:5000/empleados'); // Asegúrate de que esta ruta sea correcta
        setEmpleados(response.data);
    };

    // Función para obtener servicios de la API
    const fetchServicios = async () => {
        const response = await axios.get('http://127.0.0.1:5000/servicios'); // Asegúrate de que esta ruta sea correcta
        setServicios(response.data);
    };

    useEffect(() => {
        fetchTraslados();
        fetchEmpleados();
        fetchServicios();
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
            setSelectedTraslado(response.data);  // Guardar el traslado seleccionado
            setIsDetailModalVisible(true);      // Mostrar el modal con los detalles
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los detalles del traslado.',
            });
        }
    };

    const columns = [
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
                        Ver
                    </Button>
                    <Button type="danger" onClick={() => handleDelete(record.id)} style={{ marginLeft: '8px' }}>
                        Eliminar
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Agregar Traslado
            </Button>
            <Table dataSource={traslados} columns={columns} rowKey="id" />

            {/* Modal para agregar traslado */}
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
                    <Form.Item name="empleado_id" label="Empleado" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un empleado">
                            {empleados.map((empleado) => (
                                <Option key={empleado.legajo} value={empleado.legajo}>
                                    {empleado.nombre} {empleado.apellido}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="servicio_id" label="ID Servicio" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un servicio">
                            {servicios.map((servicio) => (
                                <Option key={servicio.id} value={servicio.id}>
                                    {servicio.establecimiento} - {servicio.nombre}
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

            {/* Modal para ver los detalles del traslado */}
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
                        <p><strong>Fecha de Inicio:</strong> {selectedTraslado.actividad.fecha_ini}</p>
                        <p><strong>Fecha de Fin:</strong> {selectedTraslado.actividad.fecha_fin}</p>
                        <p><strong>Empleado:</strong> {selectedTraslado.actividad.nombre_empleado} {selectedTraslado.actividad.apellido_empleado}</p>
                        <p><strong>Servicio:</strong> {selectedTraslado.actividad.servicio_id}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Traslados;
