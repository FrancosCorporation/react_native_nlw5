import React , {useEffect, useState}from 'react'
import {StyleSheet,Text,Image,View} from 'react-native';
import colors from '../styles/colors';
import userImg from '../assets/foto.png'
import fonts from '../styles/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
export function Header(){
    const [userName, setUserName] = useState<string>();

    useEffect(() => {
        async function loadStorageUserName() {
            const user = await AsyncStorage.getItem('@react_native_nlw5:user');
            setUserName(user || '');
        }
        loadStorageUserName();
    }, []);
    
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.greeting}>Olá</Text>
                <Text style={styles.userName}>{userName || 'Seu jardim'}</Text>
            </View>
            <Image style={styles.image} source={userImg}></Image>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingVertical:20,
    },
    image:{
        width:80,
        height: 80,
        borderRadius:40
    },
    greeting:{
        fontSize:32,
        color: colors.heading,
        fontFamily: fonts.heading
    },
    userName:{
        fontSize:32,
        fontFamily: fonts.heading,
        color: colors.heading,
        lineHeight:40
    }
})
