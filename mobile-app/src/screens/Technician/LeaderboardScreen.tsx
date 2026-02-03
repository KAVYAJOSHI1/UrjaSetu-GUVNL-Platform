import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';

interface LeaderboardUser {
    id: string;
    name: string;
    points: number;
    level: number;
    badges: string; // JSON string
}

const LeaderboardScreen = () => {
    const { t } = useLanguage();
    const navigation = useNavigation();
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = async () => {
        try {
            // Fetch linemen sorted by points descending
            const response = await fetch('http://192.168.16.108:3000/rest/v1/users?role=eq.lineman&order=points.desc');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
        const isTop3 = index < 3;


        return (
            <View style={[styles.card, isTop3 && styles.topCard]}>
                <View style={styles.rankContainer}>
                    {index === 0 ? (
                        <Icon name="award" size={24} color="#FFD700" />
                    ) : index === 1 ? (
                        <Icon name="award" size={24} color="#C0C0C0" />
                    ) : index === 2 ? (
                        <Icon name="award" size={24} color="#CD7F32" />
                    ) : (
                        <Text style={styles.rankText}>#{index + 1}</Text>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Lvl {item.level}</Text>
                    </View>
                </View>

                <View style={styles.pointsContainer}>
                    <Text style={styles.points}>{item.points}</Text>
                    <Text style={styles.pointsLabel}>pts</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e3c72', '#2a5298']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('home.leaderboard') || 'Leaderboard'}</Text>
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color="#1e3c72" style={styles.loader} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    loader: {
        marginTop: 40,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topCard: {
        borderWidth: 1,
        borderColor: '#FFD700',
        backgroundColor: '#FFFDF0',
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    levelBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    levelText: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '600',
    },
    pointsContainer: {
        alignItems: 'flex-end',
    },
    points: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3c72',
    },
    pointsLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default LeaderboardScreen;
