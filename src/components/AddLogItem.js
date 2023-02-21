import React, { useState } from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

const AddLogItem = () => {
    const [text, setText] = useState('');
    const [user, setUser] = useState('');
    const [priority, setPriority] = useState('');

    return (
        <Card className="mt-5 mb-3">
            <Card.Body>
                <Form> 
                    <Row className="my-3">
                        <Col>
                            <Form.Control placeholder="Log" value={text} onChange={(e) => setText(e.target.value)}/>
                        </Col>
                    </Row>
                    <Row className="my-3">
                        <Col>
                            <Form.Control placeholder="User" value={text} onChange={(e) => setUser(e.target.value)} />
                        </Col>
                    
                        <Col>
                            <Form.Control as="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="0">Select Priority</option>
                                <option value="low">Low</option>
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                            </Form.Control>
                        </Col>
                    </Row>

                    <Row className="my-3">
                        <Col>
                            <Button type="submit" variant="secondary" block="true">
                                Add Log
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    )
}

export default AddLogItem