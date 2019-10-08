import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./index.less";

import HeaderBar from "./Components/Top Level/HeaderBar/HeaderBar";
import SideBar from "./Components/Top Level/SideBar/VersionCreator/SideBar";
import ContentArea from "./Components/Top Level/ContentArea/ContentArea";

import NodeDisplay from "./Components/Pages/NodeDisplayPage/NodePage";
import LearningPage from "./Components/Pages/LearningNodePage/LearningPage";
import ExamPage from "./Components/Pages/ExamPage/ExamPage";
import AccountPage from "./Components/Pages/AccountPage/AccountPage";
import CourseBuilder from "./Components/Pages/CourseBuilder/CourseBuilder";
import HomePage from './Components/Pages/HomePage/HomePage';
import SearchResultPage from "./Components/Pages/Search/SearchResult";

import CourseDisplayPage from "./Components/Pages/CourseDisplayPage/CourseDisplayPage";
import PageBuilder from "./Components/Pages/PageBuilder/PageBuilder";

import SearchState from './Context/Search/SearchState'
import AuthProvider from "./Components/Utility/AuthProvider"

export default class Root extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            sidestate: true,
        }
    }
    componentDidMount() {
        console.log("[CORE] React has loaded");
    }

    componentWillMount() {
        console.log("[CORE] React will load");
    }

    ToggleState = () => {
        this.setState({
            sidestate: !this.state.sidestate,
        })
    }

    render() {
        return (
            <AuthProvider>
                <SearchState>
                    <Router>
                        <div>
                            <HeaderBar />
                            <div className="contentarea">
                                <SideBar sidestate={this.state.sidestate} />
                                <ContentArea sidestate={this.state.sidestate} toggler={this.ToggleState}>
                                    <Switch>
                                        <Route path="/searchresults" component={SearchResultPage} />
                                        <Route path="/learning" component={LearningPage} />
                                        <Route path="/learning/:nodeID" component={LearningPage} />
                                        <Route path="/course/:id" component={CourseDisplayPage} />
                                        <Route path="/exam" component={ExamPage} />
                                        <Route path="/account" component={AccountPage} />
                                        <Route path="/node/:id/coursebuilder" component={CourseBuilder} />
                                        <Route path="/node/:id/builder/Draft.css" component={PageBuilder} />
                                        <Route path="/node/:id/builder" component={PageBuilder} />
                                        <Route path="/node/:id" component={NodeDisplay} />
                                        <Route path="/node/" component={NodeDisplay} />
                                        <Route path="/" exact component={HomePage} />
                                    </Switch>
                                </ContentArea>
                            </div>
                        </div>
                    </Router>
                </SearchState>
            </AuthProvider>
        );
    }
}

render(
    <Root />,
    document.getElementById("root")
);