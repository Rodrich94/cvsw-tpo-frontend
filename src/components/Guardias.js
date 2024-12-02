import React, { useState, useEffect } from 'react';
import { Flex, Rate, Table, Tag, Button, Modal, Form, DatePicker, Select, Typography, notification } from 'antd';
import { ClockCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { Text } = Typography;


const styles = {
    button: {
        margin: '10px 10px 10px 0px'
    },
    tag: {
        fontWeight: 'bold',
        textTransform: 'uppercase'
    }
};

const formLayout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};

const Guardias = () => {
    const [guardias, setGuardias] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [establecimientos, setEstablecimientos] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [periodo, setPeriodo] = useState([]);
    const [guardiasForm, setGuardiasForm] = useState([{ key: 0, fecha_ini: '', fecha_fin: '', duracion: 24 }]);
    const [form] = Form.useForm();

    const fetchGuardias = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/guardias');
            setGuardias(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener las guardias.',
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

    const handleAdd = async (values) => {
        const datos = { ...values, periodo: periodo, guardias: guardiasForm };
        try {
            await axios.post('http://127.0.0.1:5000/guardia/empleado', datos);
            fetchGuardias();
            setIsModalVisible(false);
            setPeriodo([]);
            setGuardiasForm([{ key: 0, fecha_ini: '', fecha_fin: '', duracion: 24 }]);
            form.resetFields();
            notification.success({
                message: 'Guardias creadas',
                description: 'Las guardias fueron creadas correctamente.',
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al agregar las guardias.',
            });
        }
    };

    const handleMasGuardias = () => {
        setGuardiasForm([
            ...guardiasForm,
            {
                key: guardiasForm.length,
                fecha_ini: '',
                fecha_fin: '',
                duracion: 24
            },
        ]);
    };

    const handleMenosGuardias = (rowId) => {
        guardiasForm.pop(rowId);
        setGuardiasForm([...guardiasForm]);
    };

    const handlePeriodo = (_, fecha) => {
        if (!moment(fecha).isValid()) {
            setPeriodo([]);
            return;
        };

        const fin = moment(fecha).date(15).format('YYYY-MM-DD');
        const inicio = moment(fin).subtract(1, 'month').add(1, 'day').format('YYYY-MM-DD');

        setPeriodo([inicio, fin]);
    };

    const TipoTag = ({ tipo }) => {
        if (!tipo) return '';
        const tipoCap = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const color = tipoCap == 'Activa' ? 'magenta' : 'blue';

        return (
            <Flex gap="middle">
                <Tag style={styles.tag} color={color}>{tipoCap}</Tag>
            </Flex>
        );
    };

    const EstadoTag = ({ estado }) => {
        if (!estado) return '';
        const estadoCap = estado.charAt(0).toUpperCase() + estado.slice(1);
        const color = estadoCap == 'Pendiente' ? 'orange' : 'green';

        return (
            <Flex gap="middle">
                <Tag style={styles.tag} color={color}>{estadoCap}</Tag>
            </Flex>
        );
    };

    const DuracionRate = ({ duracion }) => {
        const value = duracion == 24 ? 1 : 0.5;

        return (
            <Flex gap="middle">
                <Rate
                    allowHalf
                    disabled
                    count="1"
                    defaultValue={value}
                    character={<ClockCircleOutlined />}
                />
                <span>{`${duracion} hs`}</span>
            </Flex>
        );
    };

    const columns = [
        {
            title: 'Empleado',
            dataIndex: 'legajoEmpleado',
            key: 'legajoEmpleado',
        },
        {
            title: 'Tipo',
            key: 'tipo',
            render: (_, record) => (<TipoTag tipo={record.tipo} />),
        },
        {
            title: 'Duración',
            key: 'duracion',
            render: (_, record) => (<DuracionRate duracion={record.duracion} />),
        },
        {
            title: 'Estado',
            key: 'estado',
            render: (_, record) => (<EstadoTag estado={record.estado} />),
        },
        {
            title: 'Fecha inicio',
            key: 'fechaInicio',
            render: (_, record) => (`${moment(record.fechaInicio).format('DD/MM/YYYY')}`),
        },
        {
            title: 'Fecha fin',
            key: 'fechaFin',
            render: (_, record) => (`${moment(record.fechaFin).format('DD/MM/YYYY')}`),
        },
    ];

    const colsFormGuardias = [
        {
            title: 'Inicio',
            key: 'fecha_ini',
            render: (_, record) => (
                <Form.Item rules={[{ required: true }]}>
                    <DatePicker onChange={(_, value) => {
                        guardiasForm[record.key].fecha_ini = moment(value).format('YYYY-MM-DD');
                        setGuardiasForm([...guardiasForm]);
                    }} defaultValue={record.fecha_ini} />
                </Form.Item>
            ),
        },
        {
            title: 'Fin',
            key: 'fecha_fin',
            render: (_, record) => (
                <Form.Item rules={[{ required: true }]}>
                    <DatePicker onChange={(_, value) => {
                        guardiasForm[record.key].fecha_fin = moment(value).format('YYYY-MM-DD');
                        setGuardiasForm([...guardiasForm]);
                    }} defaultValue={record.fecha_fin} />
                </Form.Item>
            ),
        },
        {
            title: 'Duración',
            key: 'duracion',
            render: (_, record) => (
                <Form.Item rules={[{ required: true }]}>
                    <Select placeholder="Selecciona un tipo" defaultValue={record.duracion} onChange={(value) => {
                        guardiasForm[record.key].duracion = value;
                        setGuardiasForm([...guardiasForm]);
                    }}>
                        <Option value={12}>12 hs</Option>
                        <Option value={24}>24 hs</Option>
                    </Select>
                </Form.Item>
            ),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <Form.Item>
                    <Button danger onClick={() => handleMenosGuardias(record.key)} icon={<DeleteOutlined />}>
                        Quitar
                    </Button>
                </Form.Item>
            ),
        }
    ];

    useEffect(() => {
        fetchGuardias();
        fetchEstablecimientos();
    }, []);

    return (
        <div>
            <div>
                <Button type="primary" style={styles.button} onClick={() => setIsModalVisible(true)} icon={<PlusOutlined />}>
                    Agregar Guardias
                </Button>
                <Table dataSource={guardias} columns={columns} rowKey="id" />
            </div>

            <Modal
                title="Agregar guardias por empleado"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} onFinish={handleAdd} {...formLayout}>

                    {/* Selección de establecimiento */}
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

                    {/* Selección del servicio */}
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

                    {/* Datos del empleado y tipo de guardias a cargar */}
                    <Form.Item name="legajo_empleado" label="Empleado" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un empleado">
                            {empleados.map((empleado) => (
                                <Option key={empleado.legajo} value={empleado.legajo}>
                                    {empleado.nombre} {empleado.apellido}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
                        <Select placeholder="Selecciona un tipo">
                            <Option value={'Activa'}>Activa</Option>
                            <Option value={'Pasiva'}>Pasiva</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="periodo" label="Periodo" rules={[{ required: true }]}>
                        <DatePicker picker="month" onChange={handlePeriodo} />
                    </Form.Item>

                    {/* Guardias a cargar */}
                    <Flex gap="middle">
                        <Button type="primary" onClick={handleMasGuardias}>Agregar más</Button>
                        <Text italic type="secondary">
                            {periodo.length == 2 ?
                                `Desde el ${moment(periodo[0]).format('DD/MM/YY')} ` +
                                `hasta el ${moment(periodo[1]).format('DD/MM/YY')}` :
                                ''
                            }
                        </Text>
                    </Flex>
                    <Table dataSource={guardiasForm} columns={colsFormGuardias} rowKey="key" />

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Guardar
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Guardias;
