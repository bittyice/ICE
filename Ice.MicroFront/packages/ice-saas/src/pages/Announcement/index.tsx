import React, { useEffect, useState } from "react";
import { Button, Typography, Divider, Input, message, Modal, Switch, Image, DatePicker } from 'antd';
import { AnnouncementApi } from 'ice-core';
import dayjs, { Dayjs } from 'dayjs';

type Announcement = {
    title: string,
    content: string,
    expiration: string,
}

var defaultAnnouncement = { title: '', content: '', expiration: new Date().toISOString() };

export default () => {
    const [announcement, setAnnouncement] = useState<Announcement>({ ...defaultAnnouncement });

    useEffect(() => {
        AnnouncementApi.getAnnouncement().then(data => {
            setAnnouncement(data || { ...defaultAnnouncement });
        });
    }, []);

    const submit = () => {
        AnnouncementApi.setAnnouncement(announcement);
    }

    return <div>
        <div className="flex flex-col p-8 gap-4 bg-white rounded-md">
            <div>
                <span>标题</span>
                <Input
                    className="mt-2"
                    placeholder="标题"
                    showCount
                    maxLength={128}
                    value={announcement.title}
                    onChange={e => {
                        announcement.title = e.currentTarget.value;
                        setAnnouncement({ ...announcement });
                    }}
                />
            </div>
            <div>
                <span>内容</span>
                <Input
                    className="mt-2"
                    placeholder="内容"
                    showCount
                    maxLength={128}
                    value={announcement.content}
                    onChange={e => {
                        announcement.content = e.currentTarget.value;
                        setAnnouncement({ ...announcement });
                    }}
                />
            </div>
            <div>
                <span>过期时间</span>
                <DatePicker
                    className="ml-2"
                    showTime
                    value={dayjs(announcement.expiration)}
                    onChange={value => {
                        if (!value) {
                            return;
                        }
                        announcement.expiration = value?.toISOString();
                        setAnnouncement({ ...announcement });
                    }}
                />
            </div>
            <div>
                <Button type='primary' onClick={submit}>保存设置</Button>
            </div>
        </div>
    </div>
}