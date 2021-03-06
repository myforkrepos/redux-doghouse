import { bindActionCreators } from 'redux';
import { ScopedActionFactory } from './ScopedActionFactory';
import * as object from './utils/object-shim';

// Actions
// =======
const bindScopedActionFactory = (creator, dispatch, bindFn) => {
    if (creator instanceof ScopedActionFactory) {
        // ScopedActionFactories shouldn't bind yet; they should return a
        // clone which will bind them once their scope() method is called
        const boundFactory = new ScopedActionFactory();
        boundFactory.scope = id => bindFn(creator.scope(id), dispatch);
        return boundFactory;
    } else if (typeof creator === 'function') {
        return bindFn(creator, dispatch);
    }
};

export const bindScopedActionFactories = (
    creators, dispatch, bindFn = bindActionCreators
) => {
    const isCreator = c =>
        c instanceof ScopedActionFactory || typeof c === 'function';
    if (isCreator(creators)) {
        return bindScopedActionFactory(creators, dispatch, bindFn);
    } else if (!creators || typeof creators !== 'object') {
        throw new Error(
            'bindScopedActionFactories expected an object or a function ' +
            `instead of ${creators}`
        );
    }
    return object.entries(creators).reduce((result, [key, creator]) => {
        if (isCreator(creator)) {
            result[key] = bindScopedActionFactory(creator, dispatch, bindFn);
        } else if (typeof creator === 'object') {
            result[key] = bindScopedActionFactories(creator, dispatch, bindFn);
        }
        return result;
    }, {});
};
