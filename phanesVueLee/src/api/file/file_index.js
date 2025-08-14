import api from "@/plugins/axiosinterceptor";

const projectFile = async (req) => {
    let data = {};
    let url = '/web02/api/v1/file/upload';

    await api.post(url, req)
        .then((res) => {
            data = res.data;
        })
        .catch((error) => {
            data = error.data;
        });

    return data;
}


async function fetchProjectTree(projectId) {
    // [백엔드 연동] API가 있으면 여기에 연결하세요.
    // 예: return await api.getProjectTree({ projectId });
    // 여기서는 스크린샷과 유사한 더미 데이터로 보여줄게요.
    return [
        { type: 'folder', name: '.gradle', children: [] },
        { type: 'folder', name: '.idea', children: [] },
        { type: 'folder', name: 'build', children: [] },
        { type: 'folder', name: 'gradle', children: [] },
        {
            type: 'folder', name: 'src', children: [
                {
                    type: 'folder', name: 'main', children: [
                        {
                            type: 'folder', name: 'java', children: [
                                {
                                    type: 'folder', name: 'org.example.coding_convention', children: [
                                        { type: 'folder', name: 'chat', children: [] },
                                        { type: 'folder', name: 'common', children: [] },
                                        {
                                            type: 'folder', name: 'config', children: [
                                                {
                                                    type: 'folder', name: 'filter', children: [
                                                        { type: 'file', name: 'JwtAuthFilter.java', path: '/src/main/java/.../config/filter/JwtAuthFilter.java' },
                                                        { type: 'file', name: 'LoginFilter.java', path: '/src/main/java/.../config/filter/LoginFilter.java' },
                                                    ]
                                                },
                                                { type: 'file', name: 'SecurityConfig.java', path: '/src/main/java/.../config/SecurityConfig.java' },
                                            ]
                                        },
                                        {
                                            type: 'folder', name: 'project', children: [
                                                {
                                                    type: 'folder', name: 'controller', children: [
                                                        { type: 'file', name: 'ProjectController.java', path: '/src/main/java/.../project/controller/ProjectController.java' },
                                                    ]
                                                },
                                                {
                                                    type: 'folder', name: 'model', children: [
                                                        { type: 'file', name: 'Project.java', path: '/src/main/java/.../project/model/Project.java' },
                                                        { type: 'file', name: 'ProjectDto.java', path: '/src/main/java/.../project/model/ProjectDto.java' },
                                                    ]
                                                },
                                                {
                                                    type: 'folder', name: 'repository', children: [
                                                        { type: 'file', name: 'ProjectRepository.java', path: '/src/main/java/.../project/repository/ProjectRepository.java' },
                                                    ]
                                                },
                                                {
                                                    type: 'folder', name: 'service', children: [
                                                        { type: 'file', name: 'ProjectService.java', path: '/src/main/java/.../project/service/ProjectService.java' },
                                                    ]
                                                },
                                            ]
                                        },
                                        { type: 'folder', name: 'project_member', children: [] },
                                        { type: 'folder', name: 'user', children: [] },
                                        { type: 'folder', name: 'utils', children: [] },
                                        { type: 'file', name: 'CodingConventionApplication.java', path: '/src/main/java/.../CodingConventionApplication.java' },
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { type: 'folder', name: 'resources', children: [] },
            ]
        },
        { type: 'file', name: 'build.gradle', path: '/build.gradle' },
        { type: 'file', name: 'settings.gradle', path: '/settings.gradle' },
    ];
}

// --- [추가] 파일 읽기 (백엔드 연동 지점) ---
async function readFileFromServer(projectId, path) {
    // 예: const { content } = await api.readFile({ projectId, path });
    // 여기서는 더미 컨텐츠
    return `// ${path}
public class Example {
    public static void main(String[] args) {
        System.out.println("Loaded: ${path}");
    }
}`;
}

// --- [추가] 파일 열기 공통 함수 ---
async function openFile(path, fileName) {
    try {
        const content = await readFileFromServer(datas.projectId, path);
        if (sourceEditor) {
            sourceEditor.setValue(content ?? '');
            datas.fileName = fileName || path;
            setLanguageByFilename(datas.fileName);
            setFontSizeAll(13);
        }
    } catch (e) {
        if (stdoutEditor) stdoutEditor.setValue(`[openFile error] ${e?.message || e}`);
    }
}

export default { projectFile, fetchProjectTree }