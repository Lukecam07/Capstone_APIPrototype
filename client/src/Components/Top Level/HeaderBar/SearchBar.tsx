import React, { useState, useContext } from 'react';
import SearchContext from "../../../Context/Search/searchContext";
import "./SearchBar.less";
import { Input, Button, Form } from 'antd';
import { withRouter } from 'react-router-dom'

const SearchBar = (props: any) => {

    const searchContext = useContext(SearchContext);
    const [text, setText] = useState('');

    const onSubmit = (e: any) => {
        //stops it from submitting to a file                    
        e.preventDefault();

        // prevents null search
        if (text === '') {
            // alertContext.setAlert('Please enter something...', 'light');
        } else {
            //passes the text up to the app level
            searchContext.searchNodes(text);
            setText('');
            props.history.push('/searchresults');
        }

    };

    //Since its only one expression the function can be simplified
    const onChange = (e: any) => setText(e.target.value);

    return (
        <div className="searcharea">
            <Form layout="inline" className="form" onSubmit={onSubmit}>
                <Form.Item>
                    <Input placeholder="Search" value={text} onChange={onChange} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" shape="circle" icon="search" onClick={onSubmit} />
                </Form.Item>
            </Form>
        </div>
    )
}

export default withRouter(SearchBar)