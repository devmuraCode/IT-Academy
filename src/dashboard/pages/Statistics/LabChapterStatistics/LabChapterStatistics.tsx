import '../../Statistics/Statistics.scss'
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks"
import {Link, useNavigate, useParams} from 'react-router-dom'
import React, {useEffect} from 'react'
import {clearStatisticsUserDetail, getStatisticsUserDetailLab} from "../../../../redux/reducers/coursesReducer"
import {getStatisticsUserDetailLabSelector} from "../../../../redux/selectors/coursesSelectors";
import {Table} from 'antd'
import 'moment/locale/ru'
import {useTranslation} from 'react-i18next'
import Timer from "react-compound-timer";
import {getPermission} from "../../../../redux/selectors/authorizationSelectors";
import Preloader from "../../../../landing/components/Preloader/Preloader";

const LabChapterStatistics = () => {
    const {t} = useTranslation()
    const dispatch = useAppDispatch()
    const params: any = useParams()
    const navigate = useNavigate()
    const permission = useAppSelector(state => getPermission(state))
    const lab = useAppSelector(state => getStatisticsUserDetailLabSelector(state))

    useEffect(() => {
        dispatch(getStatisticsUserDetailLab(params.id))
        return () => {
            dispatch(clearStatisticsUserDetail())
        }
    }, [])


    const columns = [
        {
            title: 'Имя',
            dataIndex: 'user__first_name',
            width: 350,
            // @ts-ignore
            render: (user__first_name, data) => (
                <Link to={`/dashboard/userDetail/${data.user__id}`}>
                    <div className='lessonTitle'>
                        <p>{user__first_name} {data.user__last_name}</p>
                    </div>
                </Link>
            ),
        },
        {
            title: 'Время',
            dataIndex: 'complete_time',
            width: 250,
            render: (complete_time: number) => (
                <Timer
                    initialTime={complete_time * 1000}
                    startImmediately={false}
                >
                    {() => (
                        <div className='timer'>
                            <p><Timer.Days/>д: <Timer.Hours/>ч: <Timer.Minutes/>мин: <Timer.Seconds/>сек</p>
                        </div>
                    )}
                </Timer>
            ),
        },
        {
            title: 'Пройдено',
            dataIndex: 'done',
            //width: 200,
            render: (done: boolean) => (
                <p>{done ? 'Да' : 'Нет'}</p>
            ),
        },
    ];

    //Protection to prevent certain roles from accessing the page
    if (permission === 'User' || permission === 'Student') {
        navigate('/dashboard/')
    }

    if (!lab) {
        return <Preloader/>
    }

    return (
        <div className='createLesson'>
            <h2 className='title'>Статистика лабораторной '{lab.title}'</h2>
            {/*// @ts-ignore*/}
            <Table columns={columns} pagination={false} scroll={{y: 540}}
                   dataSource={lab.intro}/>
        </div>
    )
}
export default LabChapterStatistics