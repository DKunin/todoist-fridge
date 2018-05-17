import settingsPage from './settings.js';
import listPage from './list.js';
const API_URL = 'https://beta.todoist.com/API/v8';
const routes = [
    { path: '/', component: listPage },
    { path: '/settings', component: settingsPage }
];

const persistList = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'updateVolume') {
            localStorage.setItem('todolist', JSON.stringify(state.list));
        }
        if (mutation.type === 'updateSettings') {
            localStorage.setItem('settings', JSON.stringify(state.settings));
        }
        if (mutation.type === 'updateData') {
            localStorage.setItem(mutation.payload.key, JSON.stringify(mutation.payload.value));
        }
    });
};

const router = new VueRouter({ routes });
const store = new Vuex.Store({
    plugins: [persistList],
    state: {
        list: JSON.parse(localStorage.getItem('list')) || [],
        labels: JSON.parse(localStorage.getItem('labels')) || {},
        settings: JSON.parse(localStorage.getItem('settings')) || {
            api_key: null,
            list_query: null
        }
    },
    mutations: {
        updateVolume(state, data) {
            const newList = state.list.map(singleItem => {
                if (singleItem.id.toString() === data.id) {
                    singleItem.volume = data.value;
                }
                return singleItem;
            });

            Vue.set(state, 'list', newList);
        },
        updateList(state, data) {
            Vue.set(state, 'list', data);
        },
        updateSettings(state, data) {
            Vue.set(state.settings, data.key, data.value);
        },
        sync(state, data) {
            state.list.forEach(singleItem => {
                if (singleItem.volume) {
                    fetch(`${API_URL}/tasks/${singleItem.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${state.settings
                                .api_key}`
                        },
                        body: JSON.stringify({
                            label_ids: [parseInt(singleItem.volume)]
                        })
                    })
                        .then(res => {
                            console.log(res);
                        })
                        .catch(err => console.log(err));
                }
            });
        },
        updateData(state, data) {
            Vue.set(state, data.key, data.value);
        }
    }
});

const template = `
    <main>
        <nav>
            <router-link to="/"><span class="icon icon-list"></span></router-link>
            <router-link to="/settings"><span class="icon icon-settings"></span></router-link>
        </nav>
        <router-view />
    </main>
`;

const app = {
    router,
    el: '#app',
    template,
    store,
    name: 'app',
    computed: {
        itemsList() {
            return this.$store.state.list;
        }
    },
    mounted() {
        fetch(
            `${API_URL}/tasks?filter=${escape(
                this.$store.state.settings.list_query
            )}`,
            {
                headers: {
                    Authorization: `Bearer ${this.$store.state.settings
                        .api_key}`
                }
            }
        )
            .then(res => res.json())
            .then(res => {
                this.$store.commit('updateData', { key: 'list', value: res });
            })
            .catch(err => console.log(err));

        fetch(`${API_URL}/labels`, {
            headers: {
                Authorization: `Bearer ${this.$store.state.settings.api_key}`
            }
        })
            .then(res => res.json())
            .then(response => {
                const value = response.reduce((newObject, singleKey) => {
                    if (singleKey.name.includes('volume_')) {
                        newObject[
                            singleKey.name.replace('volume_', '')
                        ] = singleKey;
                    }
                    return newObject;
                }, {});
                this.$store.commit('updateData', { key: 'labels', value });
            })
            .catch(err => console.log(err));
    },
    methods: {}
};

export default app;
