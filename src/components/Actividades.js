import React, { useState, useEffect } from 'react';
import { Flex, Rate, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, Typography, notification, Space } from 'antd';
import { ClockCircleOutlined, DeleteOutlined, MedicineBoxOutlined, PlusOutlined, SolutionOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const styles = {
    input: {
        margin: 10,
        minHeight: 40,
    },
    tag: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
};

const Actividades = () => {
    const [actividades, setActividades] = useState([]);
    const [legajo, setLegajo] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const fetchActividades = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/actividades/empleado/${legajo}`, {
                params: {
                    fecha_desde: fechaDesde,
                    fecha_hasta: fechaHasta,
                },
            });
            setActividades(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener las actividades.',
            });
        }
    };

    const handleChangeLegajo = (evt) => {
        setLegajo(evt.target.value);
    };

    const handleChangeFechaDesde = (_, fecha) => {
        setFechaDesde(fecha);
    };

    const handleChangeFechaHasta = (_, fecha) => {
        setFechaHasta(fecha);
    };

    const handleClickObtenerActividades = () => {
        fetchActividades();
    };

    const colsActividades = [
        {
            title: 'Empleado',
            key: 'empleado',
            render: (_, record) => (`${record.nombre} ${record.apellido} (${record.legajo})`),
        },
        {
            title: 'Fecha inicio',
            key: 'fecha_ini',
            render: (_, record) => (moment(record.fecha_ini).format('DD/MM/YY')),
        },
        {
            title: 'Fecha fin',
            key: 'fecha_fin',
            render: (_, record) => (moment(record.fecha_fin).format('DD/MM/YY')),
        },
    ];

    return (
        <div>
            <Space direction="horizontal" size="middle">

                {/* Legajo del empleado */}
                <Space.Compact>
                    <Input
                        type="text"
                        placeholder="Legajo"
                        style={styles.input}
                        onChange={handleChangeLegajo}
                        value={legajo}
                    />
                </Space.Compact>

                {/* Fecha desde (inclusive) */}
                <Space.Compact>
                    <DatePicker
                        placeholder="Desde"
                        style={styles.input}
                        onChange={handleChangeFechaDesde}
                    />
                </Space.Compact>

                {/* Fecha hasta (inclusive) */}
                <Space.Compact>
                    <DatePicker
                        placeholder="Hasta"
                        style={styles.input}
                        onChange={handleChangeFechaHasta}
                    />
                </Space.Compact>

                <Space.Compact>
                    <Button
                        type="primary"
                        style={styles.input}
                        onClick={handleClickObtenerActividades}
                    >
                        Obtener actividades
                    </Button>
                </Space.Compact>
            </Space>

            {/* Tabla de actividades */}
            <Table dataSource={actividades} columns={colsActividades} rowKey="id" />
        </div>
    );
};

export default Actividades;
