// behaviors/majorPicker.ts
import { dictionaryApi } from '../api/index'
import type { components } from '../api/schema'

type MajorVO = components['schemas']['MajorVO']
type MajorClassVO = components['schemas']['MajorClassVO']

/**
 * 专业选择器 Behavior
 * 提供专业大类加载、搜索和两级选择功能
 */
export const majorPickerBehavior = Behavior({
    data: {
        // 专业大类列表（树形结构）
        majorClasses: [] as MajorClassVO[],
        // 展平的专业列表（用于快速查找）
        flatMajors: [] as MajorVO[],
        // 选择器状态
        showMajorPicker: false,
        majorSearchKeyword: '',
        // 当前展开的大类ID
        expandedClassId: undefined as number | undefined,
        // 选中的专业
        selectedMajorId: undefined as number | undefined,
        selectedMajorName: '',
        selectedClassId: undefined as number | undefined,
        selectedClassName: '',
        // 加载状态
        majorLoading: false
    },

    methods: {
        /**
         * 加载专业大类列表
         */
        async loadMajors(params?: {
            classId?: number
            majorKeyword?: string
            classKeyword?: string
        }) {
            this.setData({ majorLoading: true })
            try {
                const res = await dictionaryApi.listMajors(params)
                const majorClasses = res.data || []

                // 展平所有专业用于快速查找
                const flatMajors: MajorVO[] = []
                majorClasses.forEach(mc => {
                    if (mc.majors) {
                        flatMajors.push(...mc.majors)
                    }
                })

                this.setData({
                    majorClasses,
                    flatMajors,
                    majorLoading: false
                })
            } catch (error) {
                console.error('加载专业列表失败:', error)
                this.setData({ majorLoading: false })
            }
        },

        /**
         * 显示专业选择器
         */
        showMajorPicker() {
            this.setData({ showMajorPicker: true })
            // 确保有专业数据
            if (this.data.majorClasses.length === 0) {
                this.loadMajors()
            }
        },

        /**
         * 关闭专业选择器
         */
        closeMajorPicker() {
            this.setData({
                showMajorPicker: false,
                majorSearchKeyword: '',
                expandedClassId: undefined
            })
        },

        /**
         * 搜索专业
         */
        handleMajorSearch(e: any) {
            const keyword = e.detail
            this.setData({ majorSearchKeyword: keyword })
            this.loadMajors({ majorKeyword: keyword })
        },

        /**
         * 切换大类展开/收起
         */
        handleExpandClass(e: WechatMiniprogram.TouchEvent) {
            const { classId } = e.currentTarget.dataset as { classId: number }
            const currentExpanded = this.data.expandedClassId
            this.setData({
                expandedClassId: currentExpanded === classId ? undefined : classId
            })
        },

        /**
         * 选择专业
         */
        handleSelectMajor(e: WechatMiniprogram.TouchEvent) {
            const { major, majorClass } = e.currentTarget.dataset as {
                major: MajorVO
                majorClass: MajorClassVO
            }

            this.setData({
                selectedMajorId: major.id,
                selectedMajorName: major.majorName || '',
                selectedClassId: majorClass.id,
                selectedClassName: majorClass.className || '',
                showMajorPicker: false,
                majorSearchKeyword: '',
                expandedClassId: undefined
            })

            // 触发回调，子类可覆盖
            if (typeof (this as any).onMajorSelected === 'function') {
                (this as any).onMajorSelected(major, majorClass)
            }
        },

        /**
         * 清除选中的专业
         */
        clearSelectedMajor() {
            this.setData({
                selectedMajorId: undefined,
                selectedMajorName: '',
                selectedClassId: undefined,
                selectedClassName: ''
            })
        },

        /**
         * 根据ID查找专业
         */
        getMajorById(majorId: number): MajorVO | undefined {
            return this.data.flatMajors.find(m => m.id === majorId)
        },

        /**
         * 根据ID查找大类
         */
        getMajorClassById(classId: number): MajorClassVO | undefined {
            return this.data.majorClasses.find(mc => mc.id === classId)
        },

        /**
         * 获取当前大类下的专业列表
         */
        getMajorsByClassId(classId: number): MajorVO[] {
            const majorClass = this.getMajorClassById(classId)
            return majorClass?.majors || []
        }
    }
})

export default majorPickerBehavior
