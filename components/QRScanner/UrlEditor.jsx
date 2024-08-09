import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'

const UrlEditor = ({url, deleteFunc, editUrls, index}) => {
    const [urlTitle, setUrlTitle] = useState(url.title)

    useEffect(() => {
        editUrls(prev => {
            let arr = [...prev]
            let targetUrl = arr[index]
            targetUrl.title = urlTitle
            arr[index] = targetUrl
            return arr
        })
    }, [urlTitle])


  return (
    <View style={styles.bigCon}>
        <Text style={styles.url} numberOfLines={1}>Url: {url.data}</Text>
        <View style={styles.container}>
            <TextInput value={urlTitle} onChangeText={(e) => setUrlTitle(e)} placeholder='Add title for url' placeholderTextColor={'rgb(0, 0, 0)'} style={styles.input} />
            <TouchableOpacity title='Delete' onPress={() => deleteFunc(url)}>
                <Text style={styles.pressable}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default UrlEditor

const styles = StyleSheet.create({
    bigCon: {
        marginBottom: '5%',
        width: '90%',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingRight: '5%'
    },
    input: {
        backgroundColor: 'white',
        paddingLeft: '2%',
        fontSize: 15,
        borderWidth: 1,
        width: '60%',
        marginBottom: '5%'
    },
    url: {
        fontSize: 15,
        fontWeight: '600',
        width: '100%',
        color: 'white',
        overflow: 'hidden',
        marginBottom: '5%'
    },
    pressable: {
        color: 'red',
        fontSize: 15,
        fontWeight: '500'
    }
})