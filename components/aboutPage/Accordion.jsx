import React, {useState} from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Accordion = () => {

    const [collapsed, setCollapsed] = useState(true)
    const [collapsed1, setCollapsed1] = useState(true)
    const [collapsed2, setCollapsed2] = useState(true)
    const [collapsed3, setCollapsed3] = useState(true)
    const [collapsed4, setCollapsed4] = useState(true)
    const [collapsed5, setCollapsed5] = useState(true)
    const [collapsed6, setCollapsed6] = useState(true)



    return (
    <View style={styles.accordion}>
        <TouchableOpacity onPress={() => setCollapsed(prev => !prev)} style={collapsed ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>Who We Are</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

        <TouchableOpacity onPress={() => setCollapsed1(prev => !prev)} style={collapsed1 ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>How It Works</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed1 ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed1} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

        <TouchableOpacity onPress={() => setCollapsed2(prev => !prev)} style={collapsed2 ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>Why We Built It</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed2 ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed2} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

        <TouchableOpacity onPress={() => setCollapsed3(prev => !prev)} style={collapsed3 ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>Where is my info?</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed3 ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed3} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

        <TouchableOpacity onPress={() => setCollapsed4(prev => !prev)} style={collapsed4 ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>When can I file my info?</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed4 ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed4} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

        <TouchableOpacity onPress={() => setCollapsed5(prev => !prev)} style={collapsed5 ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>How much does it cost?</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed5 ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed5} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

        <TouchableOpacity onPress={() => setCollapsed6(prev => !prev)} style={collapsed6 ? styles.accButton : styles.accButtonNoBorder}>
            <Text style={styles.accHeadingText}>Terms and conditions</Text>
            <FontAwesomeIcon icon={ faChevronDown } style={!collapsed6 ? {transform: [{rotateX: '180deg'}], marginTop: 5} : {marginTop: 5} } size={22} color='white'/>
        </TouchableOpacity>
        <Collapsible collapsed={collapsed6} style={styles.accExpanded}>
        <Text style={styles.accExpandedText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.</Text>
        </Collapsible>

    </View>
  )
}

const styles = StyleSheet.create({
    accordion: {
        backgroundColor: 'transparent'
    },
    accButton: {
        paddingTop: 5,
        paddingBottom: 5,
        borderBottomWidth: 2,
        borderColor: 'white',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: '4%',
        paddingRight: '4%'
    },
    accButtonNoBorder: {
        paddingTop: 5,
        paddingBottom: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: '4%',
        paddingRight: '4%',
        backgroundColor: 'rgba(0, 0, 0, .3)'
    },
    accHeadingText: {
        fontSize: 22,
        fontWeight: '500',
        color: 'white'
    },
    accExpanded: {
        paddingLeft: '4%',
        paddingRight: '8%',
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderColor: 'white',
        backgroundColor: 'rgba(0, 0, 0, .3)'
    },
    accExpandedText: {
        fontSize: 17,
        color: 'white'
    }
  });
  

export default Accordion