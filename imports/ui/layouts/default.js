/**
 * @package Default Layout
 * @copyright Upscore Pte Ltd
 * @author Jason Nathan <jjnathanjr+upscore@gmail.com>  {@link https://www.jasonnathan.com}
 * @version  1.0
 */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/alanning:roles';
import './default.html';

Template.default.onCreated(function() {
    this.subscribe("_roles");
    this.autorun(() => {
        let _rt = Session.get('_resetPasswordToken'),
            _et = Session.get('_enrollAccountToken');

        Session.set('_resetPasswordToken', null);
        Session.set('_enrollAccountToken', null);

        if (_rt && !Meteor.userId()) {
            FlowRouter.go('resetPassword', { token: _rt });
            return true;
        }

        if (_et && !Meteor.userId()) {
            FlowRouter.go('betaSignup', { token: _et });
            return true;
        }
    })
})

const handleRedirect = (routes, redirect) => {
    let currentRoute = FlowRouter.getRouteName();
    if (routes.indexOf(currentRoute) > -1) {
        // let pars = {};
        // if (redirect === 'signIn') {
        //     pars.redirect = FlowRouter.path(redirect);
        // }
        Meteor.defer(() => {
            FlowRouter.go(redirect);
        })
        return true;
    }
};

Template.default.helpers({
    loggingIn() {
        return Meteor.loggingIn();
    },
    authenticated() {
        return !Meteor.loggingIn() && Meteor.user();
    },
    redirectAuthenticated() {
        if (Template.instance().subscriptionsReady()) {
            if (FlowRouter.getRouteName() === 'adminUsers' && !Roles.userIsInRole(Meteor.userId(), ['admin'], Roles.GLOBAL_GROUP)) {
                FlowRouter.go('dashboardHome');
                return true;
            }
        }
        return handleRedirect([
            'signIn',
            'betaSignup',
            'forgetPassword',
            'resetPassword'
        ], 'dashboardHome');
    },
    redirectPublic() {
        return handleRedirect([
            'dashboardHome',
        ], 'signIn');

    },
    mediumGridClass() {
        let iD = Template.instance().data.isDirectory;
        return !!iD && iD() ? "dashboardContainer" : "m7";
    }
});


Template.registerHelper("isAdmin", function() {
    if (!Meteor.userId())
        return false;

    return Roles.userIsInRole(Meteor.userId(), ['admin'], Roles.GLOBAL_GROUP)
});

Template.registerHelper("isTutor", function(){
    if (!Meteor.userId())
        return false;

    let isAdmin = Roles.userIsInRole(Meteor.userId(), ['admin'], Roles.GLOBAL_GROUP),
        isTutor = Roles.userIsInRole(Meteor.userId(), ['tutor'], Roles.GLOBAL_GROUP);

    return  isAdmin || isTutor;
})
