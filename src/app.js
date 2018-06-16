import noSleepClass from '../vendor/no-sleep.js';
import settingsPage from './settings.js';
import listPage from './list.js';
import newItem from './new-item.js';
const API_URL = 'https://beta.todoist.com/API/v8';

const noSleep = new noSleepClass();

function enableNoSleep() {
    noSleep.enable();
    document.removeEventListener('click', enableNoSleep, false);
}

document.addEventListener('click', enableNoSleep, false);

const routes = [
    { path: '/', component: listPage },
    { path: '/settings', component: settingsPage },
    { path: '/new', component: newItem },
    { path: '/edit/:itemId', component: newItem }
];

const persistList = store => {
    store.subscribe((mutation, state) => {
        if (
            mutation.type === 'updateVolume' ||
            mutation.type === 'sync' ||
            mutation.type === 'updateList'
        ) {
            localStorage.setItem('todolist', JSON.stringify(state.list));
        }
        if (mutation.type === 'updateSettings') {
            localStorage.setItem('settings', JSON.stringify(state.settings));
        }
        if (mutation.type === 'updateData') {
            localStorage.setItem(
                mutation.payload.key,
                JSON.stringify(mutation.payload.value)
            );
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
            sort: null,
            show: null,
            api_key: null,
            list_query: null
        },
        loadingStatus: 'saved'
    },
    actions: {
        addNewItem({ commit, state }, value) {
            if (state.list && state.list[0]) {
                fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${state.settings.api_key}`
                    },
                    body: JSON.stringify({
                        content: value,
                        project_id: state.list[0].project_id
                    })
                })
                    .then(res => {
                        Vue.set(state, 'loadingStatus', 'saved');
                    })
                    .catch(err => console.log(err));
            }
        },
        removeItem({ commit, state }, itemId) {
            const newList = state.list.filter(singleItem => {
                return singleItem.id.toString() !== itemId;
            });
            commit('updateList', newList);

            fetch(`${API_URL}/tasks/${itemId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${state.settings.api_key}`
                }
            })
                .then(res => {
                    Vue.set(state, 'loadingStatus', 'saved');
                })
                .catch(err => console.log(err));
        },
        updateItem({ commit, state }, { itemId, content }) {
            const newList = state.list.map(singleItem => {
                if (singleItem.id.toString() === itemId) {
                    singleItem.content = content;
                }
                return singleItem;
            });
            commit('updateList', newList);

            fetch(`${API_URL}/tasks/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${state.settings.api_key}`
                },
                body: JSON.stringify({
                    content
                })
            })
                .then(res => {
                    Vue.set(state, 'loadingStatus', 'saved');
                })
                .catch(err => console.log(err));
        },
        fetchTasks({ commit, state }) {
            fetch(
                `${API_URL}/tasks?filter=${escape(state.settings.list_query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${state.settings.api_key}`
                    }
                }
            )
                .then(res => res.json())
                .then(res => {
                    commit('updateList', res);
                })
                .catch(err => console.log(err));
        },
        fetchLabels({ commit, state }) {
            fetch(`${API_URL}/labels`, {
                headers: {
                    Authorization: `Bearer ${state.settings.api_key}`
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
                    commit('updateData', { key: 'labels', value });
                })
                .catch(err => console.log(err));
        }
    },
    mutations: {
        updateVolume(state, data) {
            const newList = state.list.map(singleItem => {
                if (singleItem.id.toString() === data.id) {
                    singleItem.label_ids = singleItem.label_ids.map(
                        singleLabelId => {
                            if (
                                !singleItem.volume ||
                                singleLabelId === parseInt(singleItem.volume)
                            ) {
                                return parseInt(data.value);
                            }
                            return singleLabelId;
                        }
                    );
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
        sync(state) {
            state.list.forEach(singleItem => {
                if (singleItem.volume) {
                    Vue.set(state, 'loadingStatus', 'loading');
                    fetch(`${API_URL}/tasks/${singleItem.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${state.settings.api_key}`
                        },
                        body: JSON.stringify({
                            label_ids: [parseInt(singleItem.volume)]
                        })
                    })
                        .then(res => {
                            Vue.set(state, 'loadingStatus', 'saved');
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
            <router-link to="/new"><span class="icon icon-plus"></span></router-link>
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
        if (!this.$store.state.settings.api_key) {
            return false;
        }
        this.$store.dispatch('fetchLabels');
        this.$store.dispatch('fetchTasks');
    },
    methods: {}
};

export default app;
