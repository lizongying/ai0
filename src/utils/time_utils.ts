class TimeUtils {
    static timestampToTime(
        timestamp: number,
        format = 'yyyy-MM-dd HH:mm:ss',
        timezone = 'Asia/Shanghai'
    ): string {
        if (!timestamp) return ''
        const date = new Date(timestamp)

        const formatter = new Intl.DateTimeFormat('zh-CN', {
            year: format.includes('yyyy') ? 'numeric' : undefined,
            month: format.includes('MM') ? '2-digit' : undefined,
            day: format.includes('dd') ? '2-digit' : undefined,
            hour: format.includes('HH') ? '2-digit' : undefined,
            hour12: false,
            minute: format.includes('mm') ? '2-digit' : undefined,
            second: format.includes('ss') ? '2-digit' : undefined,
            timeZone: timezone
        })

        let result = format;
        formatter.formatToParts(date).forEach(part => {
            const key = part.type === 'year' ? 'yyyy' :
                part.type === 'month' ? 'MM' :
                    part.type === 'day' ? 'dd' :
                        part.type === 'hour' ? 'HH' :
                            part.type === 'minute' ? 'mm' :
                                part.type === 'second' ? 'ss' : '';
            if (key) {
                result = result.replace(key, part.value.padStart(2, '0'));
            }
        })

        return result
    }
}

export default TimeUtils