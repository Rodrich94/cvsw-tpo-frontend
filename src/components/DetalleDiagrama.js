import React, { useState, useEffect } from 'react';
import { Card, Collapse, notification, Button } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const DetalleDiagrama = () => {
    const [diagrama, setDiagrama] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchDiagrama = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/diagrama/${id}`);
            setDiagrama(response.data);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response?.data?.error || 'Error al obtener los detalles del diagrama.',
            });
        }
    };

    useEffect(() => {
        fetchDiagrama();
    }, [id]);

    return (
        <div>
            <Button onClick={() => navigate('/diagramas')} style={{ marginBottom: '20px' }}>
                Atrás
            </Button>

            {diagrama && (
                <Card title={`Diagrama ID: ${diagrama.id}`}>
                    <p><strong>Fecha de Inicio:</strong> {diagrama.fecha_ini}</p>
                    <p><strong>Fecha de Fin:</strong> {diagrama.fecha_fin}</p>
                    <p><strong>Servicio:</strong> {diagrama.servicio}</p>
                    <p><strong>Establecimiento:</strong> {diagrama.establecimiento}</p>
                    <Collapse>
                        <Panel header="Actividades Extraordinarias" key="1">
                            {diagrama.actividades_extraordinarias.length > 0 ? (
                                diagrama.actividades_extraordinarias.map((actividad) => (
                                    <div key={actividad.id} style={{ marginBottom: '10px' }}>
                                        <p><strong>Actividad numero:</strong> {actividad.id}</p>
                                        <p><strong>Tipo:</strong> {actividad.tipo_actividad}</p>
                                        <p><strong>Fecha de Inicio:</strong> {actividad.fecha_ini}</p>
                                        <p><strong>Fecha de Fin:</strong> {actividad.fecha_fin}</p>
                                        <p><strong>Empleado:</strong> {actividad.nombre_empleado} {actividad.apellido_empleado} (Legajo: {actividad.legajo_empleado})</p>
                                        <hr />
                                    </div>
                                ))
                            ) : (
                                <p>No hay actividades extraordinarias asociadas.</p>
                            )}
                        </Panel>
                    </Collapse>
                </Card>
            )}
        </div>
    );
};

export default DetalleDiagrama;
