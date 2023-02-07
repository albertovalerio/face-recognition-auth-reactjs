export const ExecTime = (props) => {

    const { net, detections } = props
    const nets = Object.keys(detections)

    const getClasses = (detections) => {
        let classes = ''
        let minTime = 1000
        let maxTime = 0
        let minNet = ''
        let maxNet = ''
        Object.values(detections).forEach((d,i) => {
            if (d.time !== 0 && d.time < minTime) {
                minTime = d.time
                minNet = nets[i]
            }
            if (d.time > maxTime) {
                maxTime = d.time
                maxNet = nets[i]
            }
        })
        if (net === minNet) {
            classes = 'badge badge-success'
        } else if (net === maxNet) {
            classes = 'badge badge-danger'
        } else {
            classes = 'badge badge-secondary'
        }
        return classes
    } 

    const getValue = (detections) => {
        let value = ''
        let minTime = 1000
        let maxTime = 0
        let minNet = ''
        let maxNet = ''
        Object.values(detections).forEach((d,i) => {
            if (d.time !== 0 && d.time < minTime) {
                minTime = d.time
                minNet = nets[i]
            }
            if (d.time > maxTime) {
                maxTime = d.time
                maxNet = nets[i]
            }
        })
        if (net === minNet) {
            value = 'MIN -> ' + detections[net].time + ' sec.'
        } else if (net === maxNet) {
            value = 'MAX -> ' + detections[net].time + ' sec.'
        } else {
            value = detections[net].time + ' sec.'
        }
        return value
    } 

    return (
        <div className={detections[net].time !== 0 ? getClasses(detections) : ''}>{detections[net].time !== 0 ? getValue(detections) : '--'}</div>
    )
}