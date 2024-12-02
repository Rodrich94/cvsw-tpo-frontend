import React, { useState, useEffect } from 'react';
import {
  Flex,
  Rate,
  Table,
  Tag,
  Button,
  Input,
  DatePicker,
  Typography,
  notification,
  Space,
  Row,
  Col,
  Form,
  Modal,
  Select,
} from 'antd';
import { ClockCircleOutlined, SolutionOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Text } = Typography;

const styles = {
  input: {
    margin: 5,
    minHeight: 40,
  },
  tag: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
};

const Actividades = () => {
  const [actividades, setActividades] = useState([]);
  const [empleado, setEmpleado] = useState('');
  const [legajo, setLegajo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const fetchActividades = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/actividades/empleado/${legajo}`,
        {
          params: {
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
          },
        }
      );
      setActividades(response.data);
      if (response.data.length > 0) {
        const { nombre, apellido } = response.data[0];
        setEmpleado(`${nombre} ${apellido}`);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description:
          error.response?.data?.error || 'Error al obtener las actividades.',
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

  const TipoTag = ({ tipo }) => {
    if (!tipo) return '';
    const tipoCap = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const color = tipoCap == 'Activa' ? 'magenta' : 'blue';

    return (
      <Row>
        <Col span={12}>
          <Text strong>Tipo:</Text>
        </Col>
        <Col span={12}>
          <Tag style={styles.tag} color={color}>
            {tipoCap}
          </Tag>
        </Col>
      </Row>
    );
  };

  const EstadoTag = ({ estado }) => {
    if (!estado) return '';
    const estadoCap = estado.charAt(0).toUpperCase() + estado.slice(1);
    const color = estadoCap == 'Pendiente' ? 'orange' : 'green';

    return (
      <Flex gap='middle'>
        <Tag style={styles.tag} color={color}>
          {estadoCap}
        </Tag>
      </Flex>
    );
  };

  const DuracionRate = ({ duracion }) => {
    const value = duracion == 24 ? 1 : 0.5;
    return (
      <Row>
        <Col span={12}>
          <Text strong>Duración:</Text>
        </Col>
        <Col span={12}>
          <Rate
            allowHalf
            disabled
            count='1'
            defaultValue={value}
            character={<ClockCircleOutlined />}
          />
          <Text>{` ${duracion} hs`}</Text>
        </Col>
      </Row>
    );
  };

  const colsActividades = [
    /*{
            title: 'Empleado',
            key: 'empleado',
            render: (_, record) => (`${record.nombre} ${record.apellido} (${record.legajo})`),
        },*/
    {
      title: 'Establecimiento',
      key: 'establecimiento',
      dataIndex: 'nombre_establecimiento',
    },
    {
      title: 'Servicio',
      key: 'servicio',
      dataIndex: 'nombre_servicio',
    },
    {
      title: 'Actividad',
      key: 'tipo',
      dataIndex: 'tipo',
    },
    {
      title: 'Fecha inicio',
      key: 'fecha_ini',
      render: (_, record) => moment(record.fecha_ini).format('DD/MM/YY'),
    },
    {
      title: 'Fecha fin',
      key: 'fecha_fin',
      render: (_, record) => moment(record.fecha_fin).format('DD/MM/YY'),
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => <EstadoTag estado={record.estado} />,
    },
    {
      title: 'Detalle',
      key: 'detalle',
      render: (_, record) => {
        if (record.tipo == 'Guardia') {
          return (
            <>
              <TipoTag tipo={record.detalle.tipo} />
              <DuracionRate duracion={record.detalle.duracion} />
            </>
          );
        } else if (record.tipo == 'Traslado') {
          return (
            <>
              <Row>
                <Col span={12}>
                  <Text strong>Origen:</Text>
                </Col>
                <Col span={12}>
                  <Text>{record.detalle.origen}</Text>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Text strong>Destino:</Text>
                </Col>
                <Col span={12}>
                  <Text>{record.detalle.destino}</Text>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Text strong>Tramo:</Text>
                </Col>
                <Col span={12}>
                  <Text>{record.detalle.tramo}</Text>
                </Col>
              </Row>
            </>
          );
        } else {
          return '';
        }
      },
    },
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [fechaDesdeResumen, setFechaDesdeResumen] = useState('');
  const [fechaHastaResumen, setFechaHastaResumen] = useState('');
  const [resumenActividades, setResumenActividades] = useState([]);
  const [form] = Form.useForm();

  const { Option } = Select;

  const formLayout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const fetchEstablecimientos = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/establecimientos'
      );
      setEstablecimientos(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description:
          error.response?.data?.error ||
          'Error al obtener los establecimientos.',
      });
    }
  };

  const fetchServiciosPorEstablecimiento = async (establecimientoId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000//servicios/establecimiento/${establecimientoId}`
      );
      setServicios(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description:
          error.response?.data?.error || 'Error al obtener los servicios.',
      });
    }
  };

  useEffect(() => {
    fetchEstablecimientos();
  }, []);

  const handleClickObtenerResumenActividades = (values) => {
    const { establecimiento_id, ...datos } = {
      ...values,
      fecha_desde: fechaDesdeResumen,
      fecha_hasta: fechaHastaResumen,
    };
    fetchResumenActividades(datos);
  };

  const fetchResumenActividades = async (datos) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/actividades/servicio/${datos.servicio_id}`,
        {
          params: {
            fecha_desde: datos.fecha_desde,
            fecha_hasta: datos.fecha_hasta,
          },
        }
      );
      setResumenActividades(response.data);
    } catch (error) {
      notification.error({
        message: 'Error',
        description:
          error.response?.data?.error ||
          'Error al obtener el resumen de actividades de empleados por servicio.',
      });
    }
  };

  const handleChangeFechaDesdeResumen = (_, fecha) => {
    setFechaDesdeResumen(fecha);
  };

  const handleChangeFechaHastaResumen = (_, fecha) => {
    setFechaHastaResumen(fecha);
  };

  const colsResumenActividades = [
    {
      title: 'Empleado',
      key: 'legajo',
      dataIndex: 'legajo_empleado',
    },
    {
      title: 'Nombre',
      key: 'nombre_empleado',
      dataIndex: 'nombre',
    },
    {
      title: 'Apellido',
      key: 'apellido_empleado',
      dataIndex: 'apellido',
    },
    {
      title: 'Cantidad guardias activas',
      key: 'cantidad_guardias_activas',
      dataIndex: 'cantidad_guardias_activas',
    },
    {
      title: 'Cantidad guardias pasivas',
      key: 'cantidad_guardias_pasivas',
      dataIndex: 'cantidad_guardias_pasivas',
    },
    {
      title: 'Cantidad traslados',
      key: 'cantidad_traslados',
      dataIndex: 'cantidad_traslados',
    },
    {
      title: 'Cantidad días licencia',
      key: 'dias_licencia',
      dataIndex: 'dias_licencia',
    },
  ];

  return (
    <div>
      <div>
        <Space direction='horizontal' size='middle'>
          {/* Nombre y apellido del empleado */}
          <Space.Compact>
            <Text strong>Empleado:</Text>
          </Space.Compact>
          <Space.Compact>
            <Input disabled type='text' style={styles.input} value={empleado} />
          </Space.Compact>

          {/* Legajo del empleado */}
          <Space.Compact>
            <Input
              type='text'
              placeholder='Legajo'
              style={styles.input}
              onChange={handleChangeLegajo}
              value={legajo}
            />
          </Space.Compact>

          {/* Fecha desde (inclusive) */}
          <Space.Compact>
            <DatePicker
              placeholder='Desde'
              style={styles.input}
              onChange={handleChangeFechaDesde}
            />
          </Space.Compact>

          {/* Fecha hasta (inclusive) */}
          <Space.Compact>
            <DatePicker
              placeholder='Hasta'
              style={styles.input}
              onChange={handleChangeFechaHasta}
            />
          </Space.Compact>

          <Space.Compact>
            <Button
              type='primary'
              style={styles.input}
              onClick={handleClickObtenerActividades}
            >
              Obtener actividades
            </Button>
          </Space.Compact>

          <Button
            type='primary'
            style={styles.input}
            onClick={() => setIsModalVisible(true)}
            icon={<SolutionOutlined />}
          >
            Resumen de Actividades
          </Button>
        </Space>

        {/* Tabla de actividades */}
        <Table dataSource={actividades} columns={colsActividades} rowKey='id' />
      </div>

      <Modal
        title='Resumen de actividades de empleados por servicio'
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleClickObtenerResumenActividades}
          {...formLayout}
        >
          {/* Selección de establecimiento */}
          <Form.Item
            name='establecimiento_id'
            label='Establecimiento'
            rules={[{ required: true }]}
          >
            <Select
              placeholder='Selecciona un establecimiento'
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
          <Form.Item
            name='servicio_id'
            label='Servicio'
            rules={[{ required: true }]}
          >
            <Select placeholder='Selecciona un servicio'>
              {servicios.map((servicio) => (
                <Option key={servicio.id} value={servicio.id}>
                  {servicio.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name='fecha_desde'
            label='Desde'
            rules={[{ required: true }]}
          >
            <DatePicker onChange={handleChangeFechaDesdeResumen} />
          </Form.Item>

          <Form.Item
            name='fecha_hasta'
            label='Hasta'
            rules={[{ required: true }]}
          >
            <DatePicker onChange={handleChangeFechaHastaResumen} />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Enviar
            </Button>
          </Form.Item>
        </Form>

        <Table
          dataSource={resumenActividades}
          columns={colsResumenActividades}
          rowKey='key'
        />
      </Modal>
    </div>
  );
};

export default Actividades;
