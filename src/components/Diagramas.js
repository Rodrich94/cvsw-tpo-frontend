import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Modal, Form, DatePicker, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

const Diagramas = () => {
    const [diagramas, setDiagramas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchDiagramas = async () => {
        const response = await axios.get('http://127.0.0.1:5000/diagramas');
        setDiagramas(response.data);
    };

    const fetchServicios = async () => {
        const response = await axios.get('http://127.0.0.1:5000/servicios');
        setServicios(response.data);
    };

    useEffect(() => {
        fetchDiagramas();
        fetchServicios();
    }, []);

    const handleAdd = async (values) => {
        try {
            await axios.post('http://127.0.0.1:5000/diagrama', {
                estado: values.estado,
                fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
                fecha_fin: values.fecha_fin.format('YYYY-MM-DD'),
                servicio_id: values.servicio_id,
            });
            fetchDiagramas();
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
            fetchDiagramas();
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
            <Button type="primary" onClick={() => setIsModalVisible(true)}>Crear Diagrama</Button>
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
